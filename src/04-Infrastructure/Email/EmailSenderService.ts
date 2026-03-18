// ==================================================================
// 📩 src/04-Infrastructure/Email/EmailSenderService.ts
// ==================================================================

import { IEmailSenderService } from "@Application/Interfaces/Services/IEmailSenderService.ts";
import { IEmailService } from "@Infrastructure/Email/IEmailService.ts";
import { createLogger } from "@Infrastructure/Core/Logger.ts";
import { type AppLogger } from "@Infrastructure/Core/Logger.ts";
import { TemplateLoader } from "@Infrastructure/Helpers/TemplateLoader.ts";

const CompanyNameCfg = process.env.COMPANY_NAME || "MyCompany";
const EmailProviderCfg = process.env.EMAIL_PROVIDER || "CONSOLE";
const AdminEmailCfg = process.env.ADMIN_EMAIL || "admin@example.com";
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

  async sendVerificationEmailAsync(email: string, token: string, localIssuer: string): Promise<void> {
    const tf = "VerificationEmailTemplate.html";
    try {
      const template = TemplateLoader.loadTemplate(tf);
      if (!template) {
        this.logger.error(`❌ Template '${tf}' not found.`);
        return;
      }

      const verifyLink = `${localIssuer}/verify?token=${token}`;
      const subject = `✅ Please Verify Your Email - ${CompanyNameCfg}`;

      const htmlBody = template
        .replace("{{ CompanyName }}", CompanyNameCfg)
        .replace("{{ verify_link }}", verifyLink)
        .replace("{{ logo_url }}", `${localIssuer}/logo.png`)
        .replace("{{ year }}", TheYear);

      this.logger.info(`📧 Sending verification email to: ${email}`);
      await this.emailService.sendEmail(email, subject, htmlBody, "html");
    } catch (err) {
      this.logger.error("❌ Error sending verification email.", err);
    }
  }

  async sendForgotPasswordEmailAsync(email: string, token: string, localIssuer: string): Promise<void> {
    const tf = "VerificationEmailTemplate.html";
    try {
      const template = TemplateLoader.loadTemplate(tf);
      if (!template) {
        this.logger.error(`❌ Template '${tf}' not found.`);
        return;
      }

      const verifyLink = `${localIssuer}/verify-forgot?token=${token}`;
      const subject = `✅ Reset Your Password - ${CompanyNameCfg}`;

      const htmlBody = template
        .replace("{{ CompanyName }}", CompanyNameCfg)
        .replace("{{ verify_link }}", verifyLink)
        .replace("{{ logo_url }}", `${localIssuer}/logo.png`)
        .replace("{{ year }}", TheYear);

      this.logger.info(`📧 Sending forgot password email to: ${email}`);
      await this.emailService.sendEmail(email, subject, htmlBody, "html");
    } catch (err) {
      this.logger.error("❌ Error sending forgot password email.", err);
    }
  }

  async sendOtpEmail(otp: any, user: any): Promise<void> {
    if (!otp || !user) return;
    const tf = "otpEmailTemplate.txt";
    const template = TemplateLoader.loadTemplate(tf);

    if (!template) {
      this.logger.error(`❌ Template '${tf}' not found.`);
      return;
    }

    const toEmail = otp.Email;
    const otpCode = otp.Code;
    const expiresStr = new Date(otp.ExpiresAt).toLocaleString();
    const subject = `Your OTP Code Expiry ${expiresStr}`;
    const fullName = `${user.Firstname} ${user.Lastname}`;

    const body = template
      .replace("{code}", otpCode)
      .replace("{expires_at}", expiresStr)
      .replace("{fullname}", fullName);

    this.logger.info(`📨 Sending OTP email to ${toEmail}`);
    await this.emailService.sendEmail(toEmail, subject, body);
  }

  async sendOtpEmailHtml(email: string, subject: string, htmlBody: string, bType: "plain" | "html" = "html"): Promise<void> {
    await this.emailService.sendEmail(email, subject, htmlBody, bType);
  }

  async sendWelcomeEmail(toEmail: string, userName: string): Promise<void> {
    const subject = `Welcome, ${userName}!`;
    const body = `Hi ${userName},\n\nThanks for signing up. We're glad you're here!`;
    await this.emailService.sendEmail(toEmail, subject, body);
  }

  async notifyAdmins(adminEmails: string[], message: string): Promise<void> {
    const subject = "⚠️ System Alert";
    const body = `Admin Alert:\n${message}`;
    await this.emailService.sendEmailAsync(adminEmails, subject, body);
  }

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

      const subject = `🔐 Access Request Notification - ${fullname}`;

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
      await this.emailService.sendEmail(AdminEmailCfg, subject, htmlBody, "html");
    } catch (err) {
      this.logger.error("❌ Error notifying admin of access request.", err);
    }
  }
}
