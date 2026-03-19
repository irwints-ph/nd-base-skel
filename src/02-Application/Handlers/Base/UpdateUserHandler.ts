// ===================================================================
// 🟢 src/Application/Handlers/Base/CreateUserHandler.ts
// ===================================================================
import { UserDtoMapper } from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { performRepoAction } from "@Infrastructure/Persistence/Services/RepoActionService.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
import { UpdateUserCommand } from "@Application/Commands/Base/Users/UpdateUserCommand.ts";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts";
import { buildUser } from "@Application/Services/Base/UserFactory.ts";
import UserMapper from "@Infrastructure/Persistence/Mappers/Base/UserMapper.ts"
import UserMstr  from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";

export class UpdateUserHandler {
  private userRepoFactory: () => IUserRepository;

  // constructor(userRepoFactory: () => IUserRepository, emailSender: () => IEmailSenderService) {
  constructor(){
    this.userRepoFactory = () => GetUserRepository();
  }

  async handle(cmd: UpdateUserCommand) {

    // --------- 5️⃣ Persist with Unit of Work ----------
    const action = async (uow: any) => {
      const repo = this.userRepoFactory();
      repo.session = uow.session; // attach session
      const ormUser = await repo.getByIdOrm(cmd.userId)
      if (!ormUser) {
        throw new Error(`User not found`);
      }

      // --------- 2️⃣ Build DOMAIN USER ----------
      const domainUser = await buildUser({
        username: cmd.username,
        password: cmd.password,
        firstname: cmd.firstname,
        lastname: cmd.lastname,
        createdBy: cmd.updatedBy,
        email: cmd.email,
        updatedBy: cmd.updatedBy,
        // isEmailValidated: cmd.isEmailValidated,
      });
      domainUser.id = ormUser.UserId;
      // UserMapper.updateOrmFromDomain(ormUser,domainUser);

      // return ormUser
      // return await repo.save(domainUser);
      const saved = await repo.save(domainUser);
      return saved;
    };

    const ormUser:UserMstr | void  = await performRepoAction({
      changedBy: cmd.updatedName,
      actionName: "UpdateUser",
      action,
      // idFields: ["UserId"],
      showlog: true,
    });

    // --------- 7️⃣ Return flat DTO ----------
    return UserDtoMapper.toDomainUserFlatBase(ormUser);
  }
}
