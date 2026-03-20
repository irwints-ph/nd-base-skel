// ===================================================================
// 🟢 src/Application/Handlers/Base/CreateUserHandler.ts
// ===================================================================
import { UserDtoMapper } from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { performRepoAction } from "@Infrastructure/Persistence/Services/RepoActionService.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
import { DeleteUserCommand } from "@Application/Commands/Base/Users/DeleteUserCommand.ts";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts";
import { buildUser } from "@Application/Services/Base/UserFactory.ts";
import UserMstr  from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";

export class DeleteUserHandler {
  private userRepoFactory: () => IUserRepository;

  // constructor(userRepoFactory: () => IUserRepository, emailSender: () => IEmailSenderService) {
  constructor(){
    this.userRepoFactory = () => GetUserRepository();
  }

  async handle(cmd: DeleteUserCommand) {

    // --------- 5️⃣ Persist with Unit of Work ----------
    const action = async (uow: any) => {
      const repo = this.userRepoFactory();
      repo.session = uow.transaction; // attach session
      const ormUser = await repo.getByIdOrm(cmd.userId)
      if (!ormUser) {
        throw new Error(`User not found`);
      }


      // return ormUser
      return await repo.delete(ormUser);
    };

    const ormUser:UserMstr | void  = await performRepoAction({
      changedBy: cmd.deletedName,
      actionName: "DeleteUser",
      action,
      showlog: false,
    });

    // --------- 7️⃣ Return flat DTO ----------
    return ormUser ? UserDtoMapper.toOrmUserFlatBase(ormUser) : null;
  }
}
