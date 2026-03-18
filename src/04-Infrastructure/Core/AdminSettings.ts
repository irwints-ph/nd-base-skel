// ==================================================================
// 🧩 src/04-Infrastructure/Core/AdminSettings.ts
// ==================================================================

export interface AdminSettingsOptions {
  superRoot?: number;
  adminEmail?: string;
  companyName?: string;
  emailProvider?: string;
  auditEnabled?: boolean;
}

export class AdminSettings {
  public superRoot: number;
  public adminEmail: string;
  public companyName: string;
  public emailProvider: string;
  public auditEnabled: boolean;

  constructor(options: AdminSettingsOptions = {}) {
    this.superRoot = options.superRoot ?? parseInt(process.env.AS_SUPER_ROOT ?? "1", 10);
    this.adminEmail = options.adminEmail ?? process.env.AS_ADMIN_EMAIL ?? "no-reply@bas-cbn.com";
    this.companyName = options.companyName ?? process.env.AS_COMPANY_NAME ?? "My Company";
    this.emailProvider = options.emailProvider ?? process.env.AS_EMAIL_PROVIDER ?? "Console";
    this.auditEnabled = options.auditEnabled ?? process.env.AS_AUDIT_ENABLED === "true";
  }
}
