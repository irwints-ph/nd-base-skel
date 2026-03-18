// ===========================================
// 🧩 Infrastructure/Core/PasswordPolicySettings.ts
// ===========================================

import dotenv from "dotenv";

dotenv.config(); // Load .env

export class PasswordPolicySettings {
  public active: boolean;
  public minimum_length: number;
  public min_uppercase: number;
  public min_lowercase: number;
  public min_digits: number;
  public min_special_characters: number;
  public special_characters: string;

  constructor() {
    this.active = (process.env.PP_ACTIVE || "true").toLowerCase() === "true";
    this.minimum_length = process.env.PP_MINIMUMLENGTH ? Number(process.env.PP_MINIMUMLENGTH) : 12;
    this.min_uppercase = process.env.PP_MINUPPERCASE ? Number(process.env.PP_MINUPPERCASE) : 2;
    this.min_lowercase = process.env.PP_MINLOWERCASE ? Number(process.env.PP_MINLOWERCASE) : 2;
    this.min_digits = process.env.PP_MINDIGITS ? Number(process.env.PP_MINDIGITS) : 2;
    this.min_special_characters = process.env.PP_MINSPECIALCHARACTERS ? Number(process.env.PP_MINSPECIALCHARACTERS) : 3;
    this.special_characters = process.env.PP_SPECIALCHARACTERS || "!@#$%^&*()_+-=[]{}|;:,.<>?";
  }
}

// Singleton instance
export const passwordPolicyConfig = new PasswordPolicySettings();
