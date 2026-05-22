// ===================================================================
// 🟢 VerifyTokenHandler.ts
// ===================================================================

import { IUserRepository } from "#Domain/Interfaces/Base/IUserRepository.ts";

import { PasswordPolicyService } from "#Domain/Services/PasswordPolicyService.ts";

import { BcryptPasswordHasher } from "#Infrastructure/Auth/BcryptPasswordHasher.ts";

import {
  JwtTokenService,
  TokenPurpose,
} from "#Infrastructure/Auth/JwtTokenService.ts";

import { performRepoAction } from "#Infrastructure/Persistence/Services/RepoActionService.ts";

import { GetUserRepository } from "#Infrastructure/Dependencies/UserRepoProvider.ts";

import { VerifyCommand } from "#Contracts/Base/Users/UserSchemas.ts";

export class VerifyTokenHandler {
  constructor(
    private readonly userRepoFactory: () => IUserRepository = () =>
      GetUserRepository(),
  ) {}

  async handle(cmd: VerifyCommand) {    

    // -------------------------------------------------------------
    // 1️⃣ Decode + validate token
    // -------------------------------------------------------------
    const userData = JwtTokenService.verifyToken(
      cmd.token,
      cmd.expected_purpose,
    );

    cmd.verify_only =
      userData?.verifyOnly ?? cmd.verify_only;

    // -------------------------------------------------------------
    // 2️⃣ Repository transaction action
    // -------------------------------------------------------------
    const result = await performRepoAction({
      changedBy: userData?.email ?? "system",
      actionName: "VerifyEmail",

      action: async () => {

        let success = false;

        let message =
          "Token verified! Enter New Password.";

        const repo = this.userRepoFactory();

        // ---------------------------------------------------------
        // Invalid token
        // ---------------------------------------------------------
        if (!userData) {

          message =
            cmd.expected_purpose ===
            TokenPurpose.ACTIVATE
              ? "Invalid or expired activation token"
              : "Invalid forgot password request token";

          return {
            success,
            message,
          };
        }

        // ---------------------------------------------------------
        // Find user
        // ---------------------------------------------------------
        const ormUser = await repo.getByEmail(
          userData.email,
        );

        if (!ormUser) {

          message =
            cmd.expected_purpose ===
            TokenPurpose.ACTIVATE
              ? "Invalid or expired activation token"
              : "Invalid forgot password request token";

          return {
            success,
            message,
          };
        }

        // ---------------------------------------------------------
        // Activation validation
        // ---------------------------------------------------------
        if (
          cmd.expected_purpose ===
          TokenPurpose.ACTIVATE
        ) {

          const domainUser =
            await repo.getByEmail(
              userData.email,
            );

          const emailValidated =
            domainUser?.isEmailValidated(
              userData.email,
            );

          if (
            emailValidated &&
            !cmd.passwd
          ) {

            return {
              success,
              message: `Email '${userData.email}' is already verified.`,
            };
          }
        }

        // ---------------------------------------------------------
        // Password change flow
        // ---------------------------------------------------------
        if (cmd.passwd?.trim()) {

          const validationResult = PasswordPolicyService.validate(cmd.passwd);
          const valid = validationResult.valid;
          const pwErrors = validationResult.errors;

          if (!valid) {
            return {
              success,
              message: pwErrors.join(" "),
            };
          }
          const passwordHasher = new BcryptPasswordHasher();
          const newHash = await passwordHasher.hash(cmd.passwd);

          // -------------------------------------------------------
          // Prevent password reuse
          // -------------------------------------------------------
          if (
            ormUser.password_history?.includes(
              newHash,
            )
          ) {

            return {
              success,
              message:
                "New password cannot be one of the last used passwords",
            };
          }

          await repo.changePassword(
            ormUser.id!,
            newHash,
          );

          if (
            cmd.expected_purpose ===
            TokenPurpose.FORGOT
          ) {

            success = true;

            message =
              "Password Changed !!!";
          }

        } else {

          // -------------------------------------------------------
          // Token verification only
          // -------------------------------------------------------
          if (!userData.verifyOnly) {

            success = true;

            return {
              success,
              message,
            };
          }
        }

        // ---------------------------------------------------------
        // Email activation flow
        // ---------------------------------------------------------
        if (
          cmd.expected_purpose === TokenPurpose.ACTIVATE
        ) {

          const domainUser =
            await repo.getByEmail(
              userData.email,
            );

          if (!userData.verifyOnly) {

            message =
              "Email verified successfully!. Password Changed!";

          } else {

            message =
              "Email verified successfully!";
          }
          if(domainUser){
            domainUser.validateEmail(userData.email);
            domainUser.updated_by = domainUser.id!;
            await repo.save(domainUser);

            success = true;

            return {
              success,
              message,
            };

          }
        }

        // ---------------------------------------------------------
        // Forgot password success
        // ---------------------------------------------------------
        return {
          success,
          message,
        };
      },

      idFields: ["user_id"],
      showlog: false,
    });

    // -------------------------------------------------------------
    // 3️⃣ Final response
    // -------------------------------------------------------------
    // const CompanyNameCfg = process.env.AS_COMPANY_NAME || "";
    return {
      success: result.success,
      message: result.message,
      verifyOnly: cmd.verify_only,
      bukrs: process.env.AS_COMPANY_NAME || "",
    };
  }
}