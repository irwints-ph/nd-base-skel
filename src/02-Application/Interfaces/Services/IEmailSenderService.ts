// ===================================================================
// 📩 src/Application/Interfaces/Services/IEmailSenderService.ts
// ===================================================================
import { TokenMailer } from "@Contracts/Common/TokenMailer.ts";

/**
 * Python-aligned contract for email sender service.
 * This interface mirrors:
 * app/application/interfaces/services/i_email_senderservice.py
 */
export interface IEmailSenderService {
  /**
   * Send a verification email to the user.
   */
  sendVerificationEmailAsync(options: TokenMailer): Promise<void>;

  /**
   * Send a forgot password email to the user.
   */
  sendForgotPasswordEmailAsync(options: TokenMailer): Promise<void>;

  /**
   * Send OTP email to a user (plain/text template-based).
   */
  sendOtpEmail(otp: any, user: any): Promise<void>;

  /**
   * Send OTP email with custom HTML or plain body.
   */
  sendOtpEmailHtml(
    email: string,
    subject: string,
    htmlBody: string,
    bType?: "plain" | "html"
  ): Promise<void>;

  /**
   * Send a welcome email to a user.
   */
  sendWelcomeEmail(toEmail: string, userName: string): Promise<void>;
}