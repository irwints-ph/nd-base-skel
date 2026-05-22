// ===================================================================
// 🟢 CreateUserHandler.ts (Refactored with TokenMailer flow)
// ===================================================================

import { Transaction } from "sequelize";
import { buildUser } from "#Application/Services/Base/UserFactory.ts";
import { PasswordPolicyService } from "#Domain/Services/PasswordPolicyService.ts";
import { OneLoginAdapter } from "#Infrastructure/Adapters/OneLoginAdapter.ts";
import { JwtTokenService, TokenPurpose } from "#Infrastructure/Auth/JwtTokenService.ts";
import { UserDtoMapper } from "#Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { performRepoAction } from "#Infrastructure/Persistence/Services/RepoActionService.ts";
import { IUserRepository } from "#Domain/Interfaces/Base/IUserRepository.ts";
import { CreateUserCommand } from "#Application/Commands/Base/Users/CreateUserCommand.ts";
import { GetUserRepository } from "#Infrastructure/Dependencies/UserRepoProvider.ts";
import { getEmailSender } from "#Infrastructure/Dependencies/EmailSender.ts";
import { TokenMailer } from "#Contracts/Common/TokenMailer.ts";

export class CreateUserHandler {
  private userRepoFactory = () => GetUserRepository();
  private emailSender = () => getEmailSender();

  async handle(cmd: CreateUserCommand) {
    this.validatePassword(cmd.password);

    const domainUser = await this.buildDomainUser(cmd);

    const domainUserUpdated = await this.persistUser(cmd, domainUser);

    await this.handlePostActions(cmd, domainUser);

    if (!domainUserUpdated) {
      throw new Error("User creation failed");
    }

    return UserDtoMapper.toDomainUserFlatBase(domainUserUpdated);
  }

  // -------------------------------------------------
  // 🔐 VALIDATION
  // -------------------------------------------------
  private validatePassword(password: string) {
    const { valid, errors } = PasswordPolicyService.validate(password);
    if (!valid) {
      throw new Error(errors.join(" "));
    }
  }

  // -------------------------------------------------
  // 🧱 DOMAIN
  // -------------------------------------------------
  private async buildDomainUser(cmd: CreateUserCommand) {
    return buildUser({
      username: cmd.username,
      password: cmd.password,
      firstname: cmd.firstname,
      lastname: cmd.lastname,
      createdBy: cmd.createdBy,
      email: cmd.email,
    });
  }

  // -------------------------------------------------
  // 💾 PERSISTENCE
  // -------------------------------------------------
  private async persistUser(cmd: CreateUserCommand, domainUser: any) {
    return performRepoAction({
      changedBy: cmd.createdName ?? String(cmd.createdBy),
      actionName: "CreateUser",
      showlog: true,

      action: async (uow) => {
        const repo = this.userRepoFactory();
        const tx = uow.transaction;

        await this.ensureUniqueness(repo, cmd, tx);
        await this.handleSso(domainUser, cmd);

        return await repo.create(domainUser, tx);
      },
    });
  }

  // -------------------------------------------------
  // 🔍 UNIQUENESS
  // -------------------------------------------------
  private async ensureUniqueness(
    repo: IUserRepository,
    cmd: CreateUserCommand,
    tx: Transaction
  ) {
    if (await repo.getByUsername(cmd.username, tx)) {
      throw new Error(`Username '${cmd.username}' already exists`);
    }

    if (cmd.email && (await repo.getByEmail(cmd.email, tx))) {
      throw new Error(`Email '${cmd.email}' already exists`);
    }
  }

  // -------------------------------------------------
  // 🔐 SSO
  // -------------------------------------------------
  private async handleSso(domainUser: any, cmd: CreateUserCommand) {
    if (!cmd.ssoId) return;

    const result = await OneLoginAdapter.createUser(domainUser);

    if (!result.success) {
      throw new Error(`OneLogin failed: ${result.message}`);
    }

    const ssoId = result.message ?? "";

    if (domainUser.sso) {
      domainUser.sso.sso_id = ssoId;
    } else {
      domainUser.sso = {
        type_id: 1,
        sso_id: ssoId,
      };
    }
  }

  // -------------------------------------------------
  // 📧 EMAIL (TokenMailer flow - READY FOR FUTURE EXTENSION)
  // -------------------------------------------------
  private async handlePostActions(cmd: CreateUserCommand, domainUser: any) {
    const sendEmail = Boolean(cmd.sendVerificationEmail === true);
    // if (!sendEmail) return;
    if (sendEmail !== true) return;

    const { token } = JwtTokenService.createVerificationToken(
      cmd.email!,
      false,
      TokenPurpose.ACTIVATE
    );

    if (!cmd.issuer?.trim()) {
      throw new Error("Issuer is required to send verification email.");
    }

    if (!token?.trim()) {
      throw new Error("Verification token is required.");
    }

    const mail: TokenMailer = {
      email: cmd.email!,
      token,
      local_issuer: cmd.issuer,
      fullname: `${cmd.firstname ?? ""} ${cmd.lastname ?? ""}`.trim(),
      app_logo: domainUser?.app_logo,
      app_name: domainUser?.app_name,
    };

    const emailer = this.emailSender();

    // 🔥 CURRENT: still uses old signature
    await emailer.sendVerificationEmailAsync(mail);

    // 👉 FUTURE UPGRADE (recommended):
    // await emailer.sendVerificationEmailAsync(mail);
  }
}