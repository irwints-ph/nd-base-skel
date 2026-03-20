// ===================================================================
// 🟢 CreateUserHandler.ts (Refactored)
// ===================================================================

import { IEmailSenderService } from "@Application/Interfaces/Services/IEmailSenderService.ts";
import { buildUser } from "@Application/Services/Base/UserFactory.ts";
import { PasswordPolicyService } from "@Domain/Services/PasswordPolicyService.ts";
import { OneLoginAdapter } from "@Infrastructure/Adapters/OneLoginAdapter.ts";
import { JwtTokenService, TokenPurpose } from "@Infrastructure/Auth/JwtTokenService.ts";
import { UserDtoMapper } from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { performRepoAction } from "@Infrastructure/Persistence/Services/RepoActionService.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
import { CreateUserCommand } from "@Application/Commands/Base/Users/CreateUserCommand.ts";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts";
import { getEmailSender } from "@Infrastructure/Dependencies/EmailSender.ts";

export class CreateUserHandler {
  private userRepoFactory = () => GetUserRepository();
  private emailSender = () => getEmailSender();

  async handle(cmd: CreateUserCommand) {
    // 1️⃣ Validate
    this.validatePassword(cmd.password);

    // 2️⃣ Build domain
    const domainUser = await this.buildDomainUser(cmd);

    // 3️⃣ Persist
    const ormUser = await this.persistUser(cmd, domainUser);

    // 4️⃣ Post פעולה (email)
    await this.handlePostActions(cmd);

    // 5️⃣ Return DTO
    return UserDtoMapper.toOrmUserFlatBase(ormUser);
  }

  // -----------------------------------------------------------------
  // 🔐 VALIDATION
  // -----------------------------------------------------------------

  private validatePassword(password: string) {
    const { valid, errors } = PasswordPolicyService.validate(password);
    if (!valid) {
      throw new Error(errors.join(" "));
    }
  }

  // -----------------------------------------------------------------
  // 🧱 DOMAIN CREATION
  // -----------------------------------------------------------------

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

  // -----------------------------------------------------------------
  // 💾 PERSISTENCE (UoW)
  // -----------------------------------------------------------------
  private async persistUser(cmd: CreateUserCommand, domainUser: any) {
    return performRepoAction({
      changedBy: cmd.createdName ?? cmd.createdBy.toString(),
      actionName: "CreateUser",
      showlog: false,

      action: async (uow) => {
        const repo: IUserRepository = this.userRepoFactory();

        // attach transaction
        repo.session = uow.transaction;

        await this.ensureUniqueness(repo, cmd);
        await this.handleSso(domainUser, cmd);

        const saved = await repo.add(domainUser);
        return saved;
      },
    });
  }
  // -----------------------------------------------------------------
  // 🔍 UNIQUENESS CHECKS
  // -----------------------------------------------------------------

  private async ensureUniqueness(repo: IUserRepository, cmd: CreateUserCommand) {
    if (await repo.getByUsername(cmd.username)) {
      throw new Error(`Username '${cmd.username}' already exists`);
    }

    if (cmd.email && (await repo.getByEmail(cmd.email))) {
      throw new Error(`Email '${cmd.email}' already exists`);
    }
  }

  // -----------------------------------------------------------------
  // 🔐 SSO HANDLING
  // -----------------------------------------------------------------

  private async handleSso(domainUser: any, cmd: CreateUserCommand) {
    if (!cmd.ssoId) return;

    const result = await OneLoginAdapter.createUser(domainUser);

    if (!result.success) {
      throw new Error(`OneLogin failed: ${result.message}`);
    }

    const ssoId = result.message ?? "";

    // Encapsulated assignment
    if (domainUser.sso) {
      domainUser.sso.sso_id = ssoId;
    } else {
      domainUser.sso = {
        type_id: 1,
        sso_id: ssoId,
      };
    }
  }

  // -----------------------------------------------------------------
  // 📧 POST ACTIONS
  // -----------------------------------------------------------------

  private async handlePostActions(cmd: CreateUserCommand) {
    if (!(cmd.sendVerificationEmail ?? true)) return;

    const { token } = JwtTokenService.createVerificationToken(
      cmd.email!,
      false,
      TokenPurpose.Activate
    );

    if (!cmd.issuer?.trim()) {
      throw new Error("Issuer is required to send verification email.");
    }

    if (!token?.trim()) {
      throw new Error("Verification token is required.");
    }

    const emailer: IEmailSenderService = this.emailSender();

    await emailer.sendVerificationEmailAsync(
      cmd.email ?? "",
      token,
      cmd.issuer
    );
  }
}