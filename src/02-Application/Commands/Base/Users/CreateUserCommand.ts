// ===================================================================
// 🟢 src/app/commands/users/CreateUserCommand.ts
// ===================================================================

export interface CreateUserCommand {
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  createdBy: number;
  email?: string;
  isEmailValidated?: boolean;
  ssoId?: string;
  sendVerificationEmail?: boolean;
  verificationToken?: string | null;
  issuer?: string | null;
  createdName?: string| null;
}
