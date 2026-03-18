// ===================================================================
// 📩 src/02-Application/Interfaces/Services/IEmailSenderService.ts
// ===================================================================

export interface IEmailSenderService {

  sendVerificationEmailAsync(
    email: string,
    token: string,
    localIssuer: string
  ): Promise<void>;

  sendForgotPasswordEmailAsync(
    email: string,
    token: string,
    localIssuer: string
  ): Promise<void>;

  sendOtpEmail(
    otp: string,
    user: any
  ): Promise<void>;

  sendOtpEmailHtml(
    email: string,
    subject: string,
    htmlBody: string,
    bType?: string
  ): Promise<void>;

  sendWelcomeEmail(
    toEmail: string,
    userName: string
  ): Promise<void>;

  notifyAdmins(
    adminEmails: string[],
    message: string
  ): Promise<void>;

  notifyAdminOfAccessRequestAsync(
    email: string,
    adminToken: string,
    generalToken: string,
    localIssuer: string,
    expiresAt: Date,
    fullname?: string
  ): Promise<void>;

}