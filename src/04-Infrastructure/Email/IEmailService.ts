// ===================================================================
// 📩 src/04-Infrastructure/Email/IEmailService.ts
// ===================================================================

/**
 * Python-aligned interface:
 * api/app/infrastructure/email/i_email_service.py
 */
export interface IEmailService {
  /**
   * Send email to multiple recipients with full options.
   */
  sendEmailAsync(
    toEmails: string[],
    subject: string,
    body: string,
    type?: "plain" | "html",
    ccEmails?: string[],
    attachmentPath?: string
  ): Promise<void>;

  /**
   * Send email to a single recipient (simplified version).
   */
  sendEmail(
    toEmail: string,
    subject: string,
    body: string,
    type?: "plain" | "html"
  ): Promise<void>;
}