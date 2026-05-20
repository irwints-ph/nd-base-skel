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
  sendVerificationEmail?: boolean | false;
  verificationToken?: string | null;
  createdName?: string | null;
  actionName?: string | "CreateUser";
  isRegister?: boolean | false;
  fullname: string | null;
  issuer?: string | null;
  appLogo?: string | null;
  appLame?: string | null;
  
}
