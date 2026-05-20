// ==================================================================
// 📩 src/04-Infrastructure/Email/EmailServiceFile.ts
// ==================================================================

import { IEmailService } from "@Infrastructure/Email/IEmailService.ts";
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import fs from "fs";
import path from "path";

export class EmailServiceFile implements IEmailService {
  private outputDir = "logs/emails";

  private smtpHost = process.env.SMTP_HOST;  //EnvConfig.smtp.host;
  private smtpPort = Number(process.env.SMTP_PORT);  //EnvConfig.smtp.port;
  private smtpUser = process.env.SMTP_USER;  //EnvConfig.smtp.user;

  private ensureDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private generateFilename(type: string): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const ext = type.toLowerCase() === "html" ? "html" : "txt";
    return path.join(this.outputDir, `email_${timestamp}.${ext}`);
  }

  private buildContent(params: {
    toEmails: string[];
    subject: string;
    body: string;
    type: string;
    ccEmails?: string[];
    attachmentPath?: string;
  }): string {
    const { toEmails, subject, body, type, ccEmails, attachmentPath } = params;

    if (type.toLowerCase() === "html") {
      return `
<html>
  <body style="font-family: Arial, sans-serif;">
    <h3>Email (File Output)</h3>
    <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
    <p><strong>From:</strong> ${this.smtpUser}</p>
    <p><strong>To:</strong> ${toEmails.join(", ")}</p>
    ${ccEmails?.length ? `<p><strong>CC:</strong> ${ccEmails.join(", ")}</p>` : ""}
    <p><strong>Subject:</strong> ${subject}</p>
    <hr/>
    <div>${body}</div>
    <hr/>
    ${attachmentPath ? `<p><strong>Attachment:</strong> ${attachmentPath}</p>` : ""}
  </body>
</html>
      `.trim();
    }

    return [
      "=== Email (File Output) ===",
      `Timestamp  : ${new Date().toISOString()}`,
      `From       : ${this.smtpUser}`,
      `SMTP Host  : ${this.smtpHost}:${this.smtpPort}`,
      `To         : ${toEmails.join(", ")}`,
      ccEmails?.length ? `CC         : ${ccEmails.join(", ")}` : null,
      `Subject    : ${subject}`,
      `Body Type  : ${type}`,
      "----------- Body -----------",
      body,
      "----------------------------",
      attachmentPath ? `Attachment : ${attachmentPath} (not actually attached)` : null,
      "============================\n",
    ]
      .filter(Boolean)
      .join("\n");
  }

  // ------------------------------------------------------------------
  // 📤 MAIN METHOD (bulk style like SMTP)
  // ------------------------------------------------------------------
  async sendEmailAsync(
    toEmails: string[],
    subject: string,
    body: string,
    type: string = "plain",
    ccEmails?: string[],
    attachmentPath?: string
  ): Promise<void> {
    this.ensureDir();

    const filename = this.generateFilename(type);

    const content = this.buildContent({
      toEmails,
      subject,
      body,
      type,
      ccEmails,
      attachmentPath,
    });

    fs.writeFileSync(filename, content, "utf-8");

    console.log(`[EmailServiceFile] Email written to: ${filename}`);
  }

  // ------------------------------------------------------------------
  // 📩 SINGLE EMAIL WRAPPER (compatibility)
  // ------------------------------------------------------------------
  async sendEmail(
    toEmail: string,
    subject: string,
    body: string,
    type: string = "plain"
  ): Promise<void> {
    return this.sendEmailAsync([toEmail], subject, body, type);
  }
}