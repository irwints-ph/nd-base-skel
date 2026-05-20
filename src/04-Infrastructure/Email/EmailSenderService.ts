// ==================================================================
// 📩 src/04-Infrastructure/Email/EmailSenderService.ts
// ==================================================================

import { IEmailSenderService } from "@Application/Interfaces/Services/IEmailSenderService.ts";
import { IEmailService } from "@Infrastructure/Email/IEmailService.ts";
import { createLogger, type AppLogger } from "@Infrastructure/Core/Logger.ts";
import { TemplateLoader } from "@Infrastructure/Helpers/TemplateLoader.ts";
import { TokenMailer } from "@Contracts/Common/TokenMailer.ts";

const CompanyNameCfg = process.env.AS_COMPANY_NAME || "MyCompany";
const EmailProviderCfg = process.env.AS_EMAIL_PROVIDER || "CONSOLE";
const AdminEmailCfg = process.env.AS_ADMIN_EMAIL || "admin@example.com";
const TheYear = new Date().getFullYear().toString();

export class EmailSenderService implements IEmailSenderService {
  private logger: AppLogger;
  private emailService: IEmailService;

  constructor(emailService: IEmailService) {
    this.logger = createLogger("EmailSenderService");
    this.emailService = emailService;

    this.logger.info(
      `📌 EmailSenderService Injected: ${emailService.constructor.name} | Provider: ${EmailProviderCfg}`
    );
  }

  // ================================================================
  // 📧 VERIFICATION EMAIL (TokenMailer - Python equivalent)
  // ================================================================
  async sendVerificationEmailAsync(options: TokenMailer): Promise<void> {
    console.log("sendVerificationEmailAsync",options)
    const tf = "VerificationEmailTemplate.html";

    try {
      const template = TemplateLoader.loadTemplate(tf);
      if (!template) {
        this.logger.error(`❌ Template '${tf}' not found.`);
        return;
      }

      const verifyLink = `${options.local_issuer}/verify?token=${options.token}`;
      const subject = `✅ ${options.app_name ?? CompanyNameCfg}: Verify Your Email`;

      const htmlBody = template
        .replace("{{ company_name }}", CompanyNameCfg)
        .replace("{{ verify_link }}", verifyLink)
        .replace("{{ logo_url }}", `${options.local_issuer}${options.app_logo ?? ""}`)
        .replace("{{ year }}", TheYear)
        .replace("{{ full_name }}", options.fullname ?? "")
        .replace("{{ app_name }}", options.app_name ?? CompanyNameCfg)
        .replace("{{ title_header }}", "Verification");

      this.logger.info(`📧 Sending verification email to: ${options.email}`);

      await this.emailService.sendEmail(
        options.email,
        subject,
        htmlBody,
        "html"
      );
    } catch (err) {
      this.logger.error("❌ Error sending verification email.", err);
    }
  }

  // ================================================================
  // 🔐 FORGOT PASSWORD EMAIL
  // ================================================================
  async sendForgotPasswordEmailAsync(options: TokenMailer): Promise<void> {
    const tf = "ForgotPasswordEmailTemplate.html";

    try {
      const template = TemplateLoader.loadTemplate(tf);
      if (!template) {
        this.logger.error(`❌ Template '${tf}' not found.`);
        return;
      }

      const verifyLink = `${options.local_issuer}/verify-forgot?token=${options.token}`;
      const subject = `🔐 ${options.app_name ?? CompanyNameCfg}: Password Reset`;

      const htmlBody = template
        .replace("{{ company_name }}", CompanyNameCfg)
        .replace("{{ verify_link }}", verifyLink)
        .replace("{{ logo_url }}", `${options.local_issuer}${options.app_logo ?? ""}`)
        .replace("{{ year }}", TheYear)
        .replace("{{ full_name }}", options.fullname ?? "")
        .replace("{{ app_name }}", options.app_name ?? CompanyNameCfg);

      this.logger.info(`📧 Sending forgot password email to: ${options.email}`);

      await this.emailService.sendEmail(
        options.email,
        subject,
        htmlBody,
        "html"
      );
    } catch (err) {
      this.logger.error("❌ Error sending forgot password email.", err);
    }
  }

  // ================================================================
  // 📩 OTP EMAIL (TEXT)
  // ================================================================
  async sendOtpEmail(otp: any, user: any): Promise<void> {
    if (!otp || !user) return;

    const tf = "otpEmailTemplate.txt";
    const template = TemplateLoader.loadTemplate(tf);

    if (!template) {
      this.logger.error(`❌ Template '${tf}' not found.`);
      return;
    }

    const expiresStr = new Date(otp.ExpiresAt).toLocaleString();
    const subject = `Your OTP Code (Expires ${expiresStr})`;
    const fullName = `${user.Firstname} ${user.Lastname}`;

    const body = template
      .replace("{code}", otp.Code)
      .replace("{expires_at}", expiresStr)
      .replace("{fullname}", fullName);

    this.logger.info(`📨 Sending OTP email to ${otp.Email}`);

    await this.emailService.sendEmail(
      otp.Email,
      subject,
      body
    );
  }

  // ================================================================
  // 📩 GENERIC HTML EMAIL
  // ================================================================
  async sendOtpEmailHtml(
    email: string,
    subject: string,
    htmlBody: string,
    type: "plain" | "html" = "html"
  ): Promise<void> {
    await this.emailService.sendEmail(email, subject, htmlBody, type);
  }

  // ================================================================
  // 👋 WELCOME EMAIL
  // ================================================================
  async sendWelcomeEmail(toEmail: string, userName: string): Promise<void> {
    const subject = `Welcome, ${userName}!`;
    const body = `Hi ${userName},\n\nThanks for signing up. We're glad you're here!`;

    await this.emailService.sendEmail(toEmail, subject, body);
  }

  // ================================================================
  // ⚠️ ADMIN NOTIFICATION
  // ================================================================
  async notifyAdmins(adminEmails: string, message: string): Promise<void> {
    const subject = "⚠️ System Alert";
    const body = `Admin Alert:\n${message}`;

    await this.emailService.sendEmail(adminEmails, subject, body);
  }

  // ================================================================
  // 🔐 ACCESS REQUEST NOTIFICATION
  // ================================================================
  async notifyAdminOfAccessRequestAsync(
    email: string,
    adminToken: string,
    generalToken: string,
    localIssuer: string,
    expiresAt: Date,
    fullname = ""
  ): Promise<void> {
    const tf = "AccessRequestNotificationTemplate.html";

    try {
      const template = TemplateLoader.loadTemplate(tf);
      if (!template) {
        this.logger.error(`❌ Template '${tf}' not found.`);
        return;
      }

      const adminLink = `${localIssuer}/admin/access-requests?token=${adminToken}`;
      const generalLink = `${localIssuer}/admin/access-requests?token=${generalToken}`;

      const subject = `🔐 Access Request - ${fullname}`;

      const htmlBody = template
        .replace("{{ CompanyName }}", CompanyNameCfg)
        .replace("{{ fullname }}", fullname)
        .replace("{{ email }}", email)
        .replace("{{ admin_access_link }}", adminLink)
        .replace("{{ general_access_link }}", generalLink)
        .replace("{{ request_time }}", new Date().toLocaleString())
        .replace("{{ expires_at }}", expiresAt.toLocaleString())
        .replace("{{ logo_url }}", `${localIssuer}/logo.png`)
        .replace("{{ year }}", TheYear);

      this.logger.info(`📧 Notifying admin: ${AdminEmailCfg}`);

      await this.emailService.sendEmail(
        AdminEmailCfg,
        subject,
        htmlBody,
        "html"
      );
    } catch (err) {
      this.logger.error("❌ Error notifying admin of access request.", err);
    }
  }
}