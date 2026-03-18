// ==================================================================
// 📩 src/04-Infrastructure/Email/EmailServiceConsole.ts
// ==================================================================

import { IEmailService } from "@Infrastructure/Email/IEmailService.ts";

export class EmailServiceConsole implements IEmailService {
  private SMTP_HOST = process.env.SMTP_HOST || "localhost";
  private SMTP_PORT = Number(process.env.SMTP_PORT) || 25;
  private SMTP_USER = process.env.SMTP_USER || "console@example.com";
  private SMTP_PASS = process.env.SMTP_PASS || "";

  async sendEmailAsync(
    toEmails: string[],
    subject: string,
    body: string,
    type: "plain" | "html" = "plain",
    ccEmails?: string[],
    attachmentPath?: string
  ): Promise<void> {
    console.log("=== Email Sent (Console Only) ===");
    console.log(`From       : ${this.SMTP_USER}`);
    console.log(`SMTP Host  : ${this.SMTP_HOST}:${this.SMTP_PORT}`);
    console.log(`To         : ${toEmails.join(", ")}`);
    if (ccEmails) {
      console.log(`CC         : ${ccEmails.join(", ")}`);
    }
    console.log(`Subject    : ${subject}`);
    console.log(`Body Type  : ${type}`);
    console.log("----------- Body -----------");
    console.log(body);
    console.log("----------------------------");
    if (attachmentPath) {
      console.log(`Attachment : ${attachmentPath} (not actually attached)`);
    }
    console.log("============================\n");
  }

  async sendEmail(
    toEmail: string,
    subject: string,
    body: string,
    type: "plain" | "html" = "plain"
  ): Promise<void> {
    await this.sendEmailAsync([toEmail], subject, body, type);
  }
}
