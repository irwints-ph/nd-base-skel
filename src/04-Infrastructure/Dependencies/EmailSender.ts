// ==================================================================
// 📩 src/04-Infrastructure/Dependencies/EmailSender.ts
// ==================================================================

import { getEmailService } from "#Infrastructure/Email/EmailServiceFactory.ts";
import { EmailSenderService } from "#Infrastructure/Email/EmailSenderService.ts";
import { IEmailSenderService } from "02-Application/Interfaces/Services/IEmailSenderService.ts";

/**
 * Provides an EmailSenderService with the correct underlying provider
 * (SMTP or Console) based on environment configuration.
 */
export function getEmailSender(): EmailSenderService {
  const mailer = getEmailService(); // chooses provider via EMAIL_PROVIDER env var
  return new EmailSenderService(mailer);
}
