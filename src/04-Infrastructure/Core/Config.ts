// ===========================================
// 🧩 Infrastructure/Core/Config.ts
// ===========================================

import dotenv from "dotenv";
import { DatabaseSettings } from "./DatabaseSettings.ts";
import { OIDCSettings } from "./OIDCSettings.ts";
import { PasswordPolicySettings } from "./PasswordPolicySettings.ts";
import { AdminSettings } from "./AdminSettings.ts";
import { JWTSettings } from "./JWTSettings.ts";

// -----------------------------
// Load environment files
// -----------------------------
function loadEnvironment(): string {
  dotenv.config({ path: ".env" }); // base .env
  const envName = process.env.ENVIRONMENT?.toLowerCase() || ".env";

  if (envName && envName !== ".env" ) {
    const envFile = `.env.${envName}`;
    try {
      dotenv.config({ path: envFile, override: true });
      console.log(`[config] Loaded: ${envFile}`);
    } catch {
      console.log(`[config] No environment file found: ${envFile}`);
    }
  }
  return envName;
}
const loaded_env_file: string = loadEnvironment(); //# Don't Comment out. need to load env files

const ENVIRONMENT = process.env.ENVIRONMENT?.toLowerCase() || ""; //loadEnvironment();

// -----------------------------
// Helpers
// -----------------------------
function parseCors(value: string | string[]): string[] {
  if (typeof value === "string") {
    return value.split(",").map((v) => v.trim().replace(/\/$/, ""));
  }
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim().replace(/\/$/, ""));
  }
  throw new Error(`Invalid CORS origins format: ${value}`);
}

function safeInt(val?: string): number | undefined {
  if (!val || val.toLowerCase() === "null") return undefined;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? undefined : parsed;
}

function safeBool(val?: string): boolean {
  return String(val).toLowerCase() === "true";
}

// -----------------------------
// Main Settings Class
// -----------------------------
export class Settings {
  public ENVIRONMENT: string = ENVIRONMENT;
  public APIVERSION: string = "1.0";
  public PORT: string = process.env.PORT || "3000";
  public environment: string = ENVIRONMENT;
  public loaded_env_file: string = loaded_env_file;
  // JWT
  public GOOGLE_CLIENT_ID: string = process.env.GOOGLE_CLIENT_ID || "";
  public GetLocalIssuer?: string = process.env.GetLocalIssuer;

  // OTP
  public OTP_SECRET_KEY: string = process.env.OTP_SECRET_KEY || "";
  public OTP_EXPIRE_SEC: number = safeInt(process.env.OTP_EXPIRE_SEC) ?? 60;

  // Email
  public SMTP_USER: string = process.env.SMTP_USER || "";
  public SMTP_PASS: string = process.env.SMTP_PASS || "";
  public SMTP_HOST: string = process.env.SMTP_HOST || "smtp.office365.com";
  public SMTP_PORT: number = safeInt(process.env.SMTP_PORT) ?? 587;

  // Crypto
  public CC_CLIENT_ID?: string = process.env.CC_CLIENT_ID;
  public CC_CLIENT_SECRET?: string = process.env.CC_CLIENT_SECRET;

  // CORS
  public BACKEND_CORS_ORIGINS: string[] = parseCors(
    process.env.BACKEND_CORS_ORIGINS || []
  );

  // Nested Settings
  public database: DatabaseSettings;
  public jwt: JWTSettings;
  public oidc: OIDCSettings;
  public passwordPolicySettings: PasswordPolicySettings;
  public admin: AdminSettings;

  constructor() {
    // Nested config initialization
    this.database = new DatabaseSettings();
    this.jwt = new JWTSettings();
    this.oidc = new OIDCSettings();
    this.passwordPolicySettings = new PasswordPolicySettings();
    this.admin = new AdminSettings();

    // Populate GetLocalIssuer if missing
    if (!this.GetLocalIssuer) {
      this.GetLocalIssuer = this.jwt.JWT_ISSUER;
    }
  }

  // -----------------------------
  // Debug
  // -----------------------------
  public debugSummary(): void {
    console.log(`Environment File: ${this.loaded_env_file}`);
    // console.log(`Database URI: ${this.database.sqlalchemyUri}`);
    // console.log(`OIDC: ${this.oidc.subdomain}, ${this.oidc.clientId}`);
    console.log(`Admin Settings: ${JSON.stringify(this.admin)}`);
  }
}

// -----------------------------
// Singleton instance
// -----------------------------
export const EnvConfig = new Settings();
// EnvConfig.debugSummary();
