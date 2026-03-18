// ===================================================================
// 🟢 App/Application/Handlers/Base/CreateOlUserHandler.ts
// ===================================================================

import { buildUser as buildOlUser, buildUser } from "@Application/Services/Base/UserFactory.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
import { UserDtoMapper } from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { performRepoAction } from "@Infrastructure/Persistence/Services/RepoActionService.ts";
import { CreateOlUserCommand } from "@Application/Commands/Base/Users/CreateOlUserCommand.ts";

export class CreateOlUserHandler {

  private userRepoFactory: () => IUserRepository;

  constructor(userRepoFactory: () => IUserRepository) {
    this.userRepoFactory = userRepoFactory;
  }

  async handle(cmd: CreateOlUserCommand) {

    // -----------------------------
    // 1️⃣ Build DOMAIN user
    // -----------------------------
    const domainUser = await buildUser({
      username: cmd.user.username,
      password: cmd.user.password,
      firstname: cmd.user.firstname,
      lastname: cmd.user.lastname,
      createdBy: cmd.createdBy,
      email: cmd.user.email,
      // sso_id: cmd.user.sso_id,
    });

    // -----------------------------
    // 2️⃣ Repository action
    // -----------------------------
    const action = async (uow: any) => {

      const repo = this.userRepoFactory();

      // repo.session = uow.session;

      if (await repo.getByEmail(cmd.user.email, uow.session)) {
        throw new Error(`${cmd.user.email} already exists`);
      }

      return await repo.add(domainUser, uow.session);
    };

    // -----------------------------
    // 3️⃣ Perform UoW action
    // -----------------------------
    const ormUser = await performRepoAction({
      auditInfo: {
        changedBy: cmd.user.username,
        correlationId: "",
        source: "api",
      },      
      actionName: "CreateOlUser",
      action,
      idFields: ["UserId"],
      showlog: false
    });

    // -----------------------------
    // 4️⃣ Map to DTO
    // -----------------------------
    return UserDtoMapper.toDomainUserFlatBase(ormUser);

  }

}