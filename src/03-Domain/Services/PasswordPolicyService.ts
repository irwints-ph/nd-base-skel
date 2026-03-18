// ===================================================================
// 🧩 src/03-Domain/Services/PasswordPolicyService.ts
// ===================================================================

import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { PasswordValidator } from "@Infrastructure/Auth/PasswordValidator.ts";

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export class PasswordPolicyService {

  static validate(password: string): PasswordValidationResult {

    return PasswordValidator.isPasswordComplex(
      password,
      EnvConfig.passwordPolicySettings
    );

  }

}