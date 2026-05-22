// ===================================================================
// 🟢 ActivateUserHandler.ts
// ===================================================================

import { IUserRepository } from "#Domain/Interfaces/Base/IUserRepository.ts";

import { ForgotPasswordCommand } from "#Contracts/Base/Users/UserSchemas.ts";

import {
  JwtTokenService,
  TokenPurpose,
} from "#Infrastructure/Auth/JwtTokenService.ts";

import { performRepoAction } from "#Infrastructure/Persistence/Services/RepoActionService.ts";

import { GetUserRepository } from "#Infrastructure/Dependencies/UserRepoProvider.ts";

import { getEmailSender } from "#Infrastructure/Dependencies/EmailSender.ts";

import { TokenMailer } from "#Contracts/Common/TokenMailer.ts";

export class ActivateUserHandler {
  constructor(
    private readonly userRepoFactory: () => IUserRepository = () =>
      GetUserRepository(),

    private readonly emailSenderFactory = () =>
      getEmailSender(),
  ) {}

  async handle(cmd: ForgotPasswordCommand) {
    // -------------------------------------------------------------
    // 1️⃣ Validate request
    // -------------------------------------------------------------
    const request = cmd.user;

    if (!request?.email?.trim()) {
      throw new Error("Email is required to validate.");
    }

    // -------------------------------------------------------------
    // 2️⃣ Fetch + validate user
    // -------------------------------------------------------------
    const domainUser = await performRepoAction({
      changedBy: request.fullname ?? "",
      actionName: cmd.action_name ?? "ActivateUser",

      action: async () => {
        const repo = this.userRepoFactory();

        const existingUser = await repo.getByEmail(
          request.email,
        );

        if (!existingUser) {
          throw new Error(
            `Email '${request.email}' does not exist.`,
          );
        }

        const emailValidated =
          existingUser.isEmailValidated(
            request.email,
          );

        if (emailValidated) {
          throw new Error(
            `Email '${request.email}' already validated.`,
          );
        }

        return existingUser;
      },

      idFields: ["id"],
      showlog: false,
    });

    // -------------------------------------------------------------
    // 3️⃣ Generate activation token
    // -------------------------------------------------------------
    let token: string | null = null;

    const issuer =
      request.feserver?.trim() ||
      `${process.env.JWT_ISSUER}/api/auth`;

    if (cmd.send_verification_email) {

      const tokenResult =
        JwtTokenService.createVerificationToken(
          request.email,
          request.verify_only ?? false,
          TokenPurpose.ACTIVATE,
        );

      token = tokenResult.token;

      if (!issuer.trim()) {
        throw new Error(
          "Issuer is required to send activation email.",
        );
      }

      if (!token?.trim()) {
        throw new Error(
          "Verification token is required to send activation email.",
        );
      }

      // -------------------------------------------------------------
      // 4️⃣ Send activation email
      // -------------------------------------------------------------
      try {
        const emailer =
          this.emailSenderFactory();

        const fullname =
          request.fullname ||
          domainUser.profile?.fullname ||
          "User";

        const mailOptions: TokenMailer = {
          email: request.email,
          token,
          local_issuer: issuer,
          fullname,
          app_logo: request.app_logo,
          app_name: request.app_name,
        };

        await emailer.sendVerificationEmailAsync(
          mailOptions,
        );

      } catch (err: any) {
        throw new Error(
          `Failed to send activation email: ${err.message}`,
        );
      }
    }

    // -------------------------------------------------------------
    // 5️⃣ Final response
    // -------------------------------------------------------------
    if (!token) {
      return {
        success: false,
        accessToken: null,
        tokenType: "bearer",
        message:
          "Internal Error: Failed to generate verification token for activation email.",
      };
    }

    return {
      success: true,
      accessToken: token,
      tokenType: "bearer",
      message:
        "Please check your email to verify your account.",
    };
  }
}