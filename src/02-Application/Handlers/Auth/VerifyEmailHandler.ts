// ===================================================================
// 🟢 src/02-Application/Handlers/Auth/VerifyEmailHandler.ts
// ===================================================================
import { UserActivationResponse } from "01-Contracts/Base/Users/UserSchemas.ts";
import { User } from "03-Domain/Entities/Base/User/User.ts";
import { VerifyEmailCommand } from "@Application/Commands/Auth/VerifyEmailCommand.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
import { JwtTokenService } from "@Infrastructure/Auth/JwtTokenService.ts";
import { performRepoAction } from "@Infrastructure/Persistence/Services/RepoActionService.ts";

export class VerifyEmailHandler {
  private userRepoFactory: () => IUserRepository;

  constructor(userRepoFactory: () => IUserRepository) {
    this.userRepoFactory = userRepoFactory;
  }

  async handle(cmd: VerifyEmailCommand) {
    // 1️⃣ Decode token → get user_id
    const emailDetails: UserActivationResponse | null = JwtTokenService.verifyToken(cmd.token);
    let userId = -1;
    // const userId = JwtTokenService.verifyToken(cmd.token);

    const action = async (uow: any) => {
      const repo = this.userRepoFactory();
      if(emailDetails?.email){
        const user:User | null = await repo.getByEmail(emailDetails?.email, uow.transaction);
        if (!user) {
          throw new Error("Invalid or expired verification token");
        }
        user.validateEmail(emailDetails?.email);

      // if (cmd.passwd) {
      //   user.setPassword(cmd.passwd);
      // }

      // // Assuming you have an update method
      // return await repo.update(user, uow.transaction);
        userId = user?.id ?? -1;
      }

    };

    const OutOrmUser = await performRepoAction({
      changedBy: String(userId),
      actionName: "VerifyEmail",
      action,
      idFields: ["UserId"],
      showlog: true,
    });

    return {
      success: true,
      message: "Email verified successfully",
      userId: userId,
    };
  }
}
