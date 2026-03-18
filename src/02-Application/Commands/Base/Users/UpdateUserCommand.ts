// ===================================================================
// 🟢 src/app/commands/users/UpdateUserCommand.ts
// ===================================================================

export interface UpdateUserCommand {
  userId: number;
  username: string;
  password: string;
  firstname: string;
  lastname: string;
  email?: string;
  isEmailValidated?: boolean;
  updatedBy: number
  updatedName: string
}
