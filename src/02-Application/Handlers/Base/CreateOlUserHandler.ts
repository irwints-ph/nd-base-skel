// ===================================================================
// 🟢 App/Application/Handlers/Base/CreateOlUserHandler.ts
// ===================================================================

import { buildUser as buildOlUser } from "@Application/Services/Base/UserFactory.ts";
import { UserDtoMapper } from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { performRepoAction } from "@Infrastructure/Persistence/Services/RepoActionService.ts";
import { CreateOlUserCommand } from "@Application/Commands/Base/Users/CreateOlUserCommand.ts";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
import { UnitOfWork } from "02-Application/UoW/UnitOfWork.ts";

export class CreateOlUserHandler {
  private userRepoFactory = () => GetUserRepository();
  async handle(cmd: CreateOlUserCommand) {

    // -----------------------------
    // 1️⃣ Build DOMAIN user
    // -----------------------------
    const domainUser = await buildOlUser({
      username: cmd.user.username,
      password: cmd.user.password,
      firstname: cmd.user.firstname,
      lastname: cmd.user.lastname,
      createdBy: cmd.createdBy,
      email: cmd.user.email,
      ssoId: cmd.user.ssoId,
      is_email_validated: true,
    });

    // -----------------------------
    // 2️⃣ Repository action
    // -----------------------------
    const action = async (uow: UnitOfWork) => {
      const repo: IUserRepository = this.userRepoFactory();
      // repo.session = uow.transaction;// Good for showing log but has error on sqlite

      if (await repo.getByEmail(cmd.user.email)) {
        throw new Error(`${cmd.user.email} already exists`);
      }
      return await repo.add(domainUser);
    };

    // -----------------------------
    // 3️⃣ Perform UoW action
    // -----------------------------
    const ormUser = await performRepoAction({
      changedBy: cmd.user.username,
      actionName: "CreateOlUser",
      action,
      showlog: false
    });

    // -----------------------------
    // 4️⃣ Map to DTO
    // -----------------------------
    return UserDtoMapper.toOrmUserFlatBase(ormUser);

  }

}