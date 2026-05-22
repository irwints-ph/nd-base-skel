// ==================================================================
// 📩 src/04-Infrastructure/Email/EmailServiceFactory.ts
// ==================================================================

import { IEmailService } from "#Infrastructure/Email/IEmailService.ts";
import { EmailServiceConsole } from "#Infrastructure/Email/EmailServiceConsole.ts";
import { EmailServiceSMTP } from "#Infrastructure/Email/EmailServiceSMTP.ts";
import { EmailServiceFile } from "#Infrastructure/Email/EmailServiceFile.ts";

export function getEmailService(provider?: string): IEmailService {
  const envProvider = (provider || process.env.AS_EMAIL_PROVIDER || "CONSOLE").toUpperCase();
  
  switch (envProvider) {
    case "CONSOLE":
      return new EmailServiceConsole();
    case "FILE":
      return new EmailServiceFile();
    case "SMTP":
      return new EmailServiceSMTP();
    default:
      throw new Error(`Unknown email provider: ${envProvider}`);
  }
}
