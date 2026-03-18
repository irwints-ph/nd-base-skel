// ===================================================================
// 🟢 src/application/commands/base/users/CreateOlUserCommand.ts
// ===================================================================
import { UserCreateFromSso } from "@Contracts/Base/Users/UserSchemas.ts";

export interface CreateOlUserCommand {
  user: UserCreateFromSso;
  createdBy: number;
}
