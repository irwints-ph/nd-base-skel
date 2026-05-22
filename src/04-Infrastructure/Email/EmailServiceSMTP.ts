// ==================================================================
// 📩 src/04-Infrastructure/Email/EmailServiceSMTP.ts
// ==================================================================

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { IEmailService } from "#Infrastructure/Email/IEmailService.ts";

export class EmailServiceSMTP implements IEmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true if port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmailAsync(
    toEmails: string[],
    subject: string,
    body: string,
    type: "plain" | "html" = "plain",
    ccEmails?: string[],
    attachmentPath?: string
  ): Promise<void> {
    const mailOptions: any = {
      from: process.env.SMTP_USER,
      to: toEmails.join(","),
      cc: ccEmails?.join(","),
      subject,
      [type === "html" ? "html" : "text"]: body,
    };

    if (attachmentPath && fs.existsSync(attachmentPath)) {
      mailOptions.attachments = [
        {
          filename: path.basename(attachmentPath),
          path: attachmentPath,
        },
      ];
    }

    await this.transporter.sendMail(mailOptions);
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
