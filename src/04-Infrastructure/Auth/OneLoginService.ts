// ===================================================================
// 🧩 src/app/infrastructure/auth/OneLoginService.ts
// ===================================================================
import { ApiReturn } from "#Contracts/Common/BaseSchema.ts";
import { EnvConfig } from "#Infrastructure/Core/ConfigLoader.ts";
// import { UserCreateFromSso } from "#Contracts/Base/Users/UserSchemas.ts";

export class OneLoginService {
  private config = EnvConfig.oidc;
  private baseUri: string;
  private roleId: number;
  private accessToken: string | null = null;

  constructor() {
    this.baseUri = this.config.base_uri.replace(/\/$/, "");
    this.roleId = this.config.role_id ?? 0;
  }

  private async fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  async authenticate(): Promise<void> {
    const url = `${this.baseUri}/auth/oauth2/v2/token`;
    const headers = {
      Authorization: `client_id:${this.config.api_client_id}, client_secret:${this.config.api_client_secret}`,
      "Content-Type": "application/json",
    };
    const data = { grant_type: "client_credentials" };

    const response = await this.fetchWithTimeout(
      url,
      { method: "POST", headers, body: JSON.stringify(data) },
      this.config.http_timeout
    );

    if (!response.ok) {
      throw new Error(`Failed to authenticate: ${await response.text()} -> ${url}`);
    }

    const json = await response.json();
    this.accessToken = json.access_token;
    if (!this.accessToken) {
      throw new Error("access_token not found in OneLogin response");
    }
  }

  private async authHeaders(): Promise<Record<string, string>> {
    if (!this.accessToken) {
      await this.authenticate();
    }
    return {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  async getUserIdByEmail(email: string): Promise<number | null> {
    const headers = await this.authHeaders();
    const url = `${this.baseUri}/api/2/users?email=${encodeURIComponent(email)}`;
    const response = await this.fetchWithTimeout(url, { headers }, this.config.http_timeout);

    if (!response.ok) return null;
    const users = await response.json();
    return users.length > 0 ? users[0].id : null;
  }

  async createUser(
    username: string,
    email: string,
    password: string | null,
    firstname: string,
    lastname: string
  ): Promise<ApiReturn> {
    const headers = await this.authHeaders();
    const url = `${this.baseUri}/api/2/users`;
    const payload: any = { username, email, firstname, lastname };
    let rVal: ApiReturn = {
      success: false,
      message: "",
      data: null
    }
    if (password && password.trim()) {
      payload.password = password;
      payload.password_confirmation = password;
    }

    const response = await this.fetchWithTimeout(
      url,
      { method: "POST", headers, body: JSON.stringify(payload) },
      this.config.http_timeout
    );

    if (!response.ok) {
      rVal.message = `Failed to create user: ${await response.text()}`;
      // throw new Error(`Failed to create user: ${await response.text()}`);
    }

    const data = await response.json();
    if (!data.id) {
      rVal.message = `Missing user ID in response: ${JSON.stringify(data)}`;
      // throw new Error(`Missing user ID in response: ${JSON.stringify(data)}`);
    }
    rVal.message = data.id;
    rVal.success = true;
    return rVal;
  }

  // ... implement isUserInRole, addUserToRole, activateUser, setUserPassword, createUserAndAddToRole
  // following the same fetchWithTimeout pattern
}
