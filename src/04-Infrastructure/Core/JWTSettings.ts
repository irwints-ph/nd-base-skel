// ===========================================
// 🧩 Infrastructure/Core/JWTSettings.ts
// ===========================================

import dotenv from "dotenv";

dotenv.config(); // Load .env

export class JWTSettings {
  public JWT_SECRET_KEY: string;
  public JWT_TIME_OUT: number;
  public JWT_ALGORITHMS: string;
  public JWT_ISSUER: string;

  constructor() {
    this.JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "";
    this.JWT_TIME_OUT = Number(process.env.JWT_TIME_OUT) || 15;
    this.JWT_ALGORITHMS = process.env.JWT_ALGORITHMS || "HS256";
    this.JWT_ISSUER = process.env.JWT_ISSUER || "";

    // validation
    if (!this.JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET_KEY is required in environment variables");
    }
    if (!this.JWT_ISSUER) {
      throw new Error("JWT_ISSUER is required in environment variables");
    }
  }
}

// Singleton instance
export const jwtConfig = new JWTSettings();
