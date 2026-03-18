// ===========================================
// 🧩 Infrastructure/Core/OIDCSettings.ts
// ===========================================

import dotenv from "dotenv";

dotenv.config(); // Load .env

export class OIDCSettings {
  public subdomain: string;
  public issuer: string;
  public client_id: string;
  public region: string;
  public client_secret: string;
  public api_client_id: string;
  public api_client_secret: string;
  public role_id?: number;
  public auto_create: boolean;
  public http_timeout: number;

  constructor() {
    this.subdomain = process.env.OL_SUBDOMAIN || "sqlite";
    this.client_id = process.env.OL_CLIENT_ID || "";
    this.region = process.env.OL_REGION || "us";
    this.client_secret = process.env.OL_CLIENT_SECRET || "";
    this.api_client_id = process.env.OL_API_CLIENT_ID || "";
    this.api_client_secret = process.env.OL_API_CLIENT_SECRET || "";
    this.role_id = process.env.OL_ROLE_ID ? Number(process.env.OL_ROLE_ID) : undefined;
    this.auto_create = (process.env.OL_AUTO_CREATE || "false").toLowerCase() === "true";
    this.http_timeout = process.env.OL_HTTP_TIMEOUT ? Number(process.env.OL_HTTP_TIMEOUT) : 10.0;
    this.issuer =  `https://${this.subdomain}.onelogin.com/oidc/2`;

    if (!this.subdomain) {
      throw new Error("OL_SUBDOMAIN is required in environment variables");
    }
    if (!this.client_id) {
      throw new Error("OL_CLIENT_ID is required in environment variables");
    }
  }

  // --------------------------
  // Computed properties
  // --------------------------
  get base_uri(): string {
    return `https://${this.subdomain}.onelogin.com`;
  }

  get authority(): string {
    return `https://${this.subdomain}.onelogin.com/oidc/2`;
  }

  get me(): string {
    return `https://${this.subdomain}.onelogin.com/oidc/2/me`;
  }
}

// Singleton instance
export const oidcConfig = new OIDCSettings();
