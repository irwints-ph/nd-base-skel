// ===================================================================
// 🧩 App/Infrastructure/Auth/PasswordValidator.ts
// ===================================================================

import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { PasswordPolicy } from "@Contracts/Config/PasswordPolicy.ts";

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export class PasswordValidator {

  static isPasswordComplex(
    password: string,
    policy?: PasswordPolicy
  ): PasswordValidationResult {

    const errors: string[] = [];

    // // Use global config if no policy passed
    // if (!policy) {
    //   policy = EnvConfig.passwordPolicySettings;
    // }

    // Policy not active
    if (!policy || !policy.Active) {
      return { valid: true, errors };
    }

    // -----------------------------
    // Minimum length
    // -----------------------------
    if (policy.MinimumLength && password.length < policy.MinimumLength) {
      errors.push(`Password must be at least ${policy.MinimumLength} characters long.`);
    }

    // -----------------------------
    // Uppercase letters
    // -----------------------------
    const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
    if (policy.MinUppercase && uppercaseCount < policy.MinUppercase) {
      errors.push(`Password must contain at least ${policy.MinUppercase} uppercase letter(s).`);
    }

    // -----------------------------
    // Lowercase letters
    // -----------------------------
    const lowercaseCount = (password.match(/[a-z]/g) || []).length;
    if (policy.MinLowercase && lowercaseCount < policy.MinLowercase) {
      errors.push(`Password must contain at least ${policy.MinLowercase} lowercase letter(s).`);
    }

    // -----------------------------
    // Digits
    // -----------------------------
    const digitCount = (password.match(/[0-9]/g) || []).length;
    if (policy.MinDigits && digitCount < policy.MinDigits) {
      errors.push(`Password must contain at least ${policy.MinDigits} digit(s).`);
    }

    // -----------------------------
    // Special characters
    // -----------------------------
    const specialChars = policy.SpecialCharacters || "!@#$%^&*()_+-=[]{}|;:,.<>?";

    const specialRegex = new RegExp(
      `[${specialChars.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}]`,
      "g"
    );

    const specialCount = (password.match(specialRegex) || []).length;

    if (
      policy.SpecialCharacters &&
      specialCount < policy.SpecialCharacters.length
    ) {
      errors.push(
        `Password must contain at least ${policy.SpecialCharacters.length} special character(s).`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}