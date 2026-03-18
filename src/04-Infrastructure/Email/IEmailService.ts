// ==================================================================
// 📩 src/04-Infrastructure/Email/IEmailService.ts
// ==================================================================

export interface IEmailService {
  sendEmailAsync(
    toEmails: string[],
    subject: string,
    body: string,
    type?: "plain" | "html",
    ccEmails?: string[],
    attachmentPath?: string
  ): Promise<void>;

  sendEmail(
    toEmail: string,
    subject: string,
    body: string,
    type?: "plain" | "html"
  ): Promise<void>;
}
