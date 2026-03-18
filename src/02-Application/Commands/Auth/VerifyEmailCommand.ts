export interface VerifyEmailCommand {
  token: string;
  passwd?: string | null;
}