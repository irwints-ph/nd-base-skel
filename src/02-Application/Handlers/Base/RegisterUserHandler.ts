// ===================================================================
// 🟢 App/Application/Handlers/Base/RegisterUserHandler.ts
// ===================================================================

import { UserRepository } from "@Infrastructure/Persistence/Repositories/Base/UserRepository.ts";
import { User } from "@Domain/Entities/Base/User/User.ts";
import UserDtoMapper from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { UserCreateSchema } from "@Contracts/Base/Users/UserSchemas.ts";
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";
import { buildUser } from "@Application/Services/Base/UserFactory.ts";

// -----------------------------
// Command interface
// -----------------------------
export interface RegisterUserCommand {
  user: UserCreateSchema;
  issuer?: string;
}

// -----------------------------
// Handler
// -----------------------------
export default class RegisterUserHandler {
  private userRepoFactory: () => UserRepository;

  constructor(userRepoFactory: () => UserRepository) {
    this.userRepoFactory = userRepoFactory;
  }

  async handle(cmd: RegisterUserCommand) {
    // 1️⃣ Build DOMAIN user (not ORM yet)
    const domainUser: User = await buildUser({
      username: cmd.user.username,
      password: cmd.user.password,
      firstname: cmd.user.firstname ?? "",
      lastname: cmd.user.lastname ?? "",
      email: cmd.user.email,
      createdBy: cmd.user.createdBy ?? 1,
    });

    // 2️⃣ Perform repo action inside a transaction
    const result = await sequelize.transaction(async (t) => {
      const repo = this.userRepoFactory();
      // repo.setTransaction(t);

      // Check username/email duplicates
      if (await repo.getByUsername(domainUser.username)) {
        throw new Error(`${domainUser.username} already exists`);
      }
      if (domainUser.contacts.length > 0 && (await repo.getByEmail(domainUser.contacts[0].ContactValue))) {
        throw new Error(`${domainUser.contacts[0].ContactValue} already exists`);
      }

      // Add user to DB (returns ORM instance)
      const ormUser = await repo.add(domainUser);

      // Optional: send verification email
      // await EmailService.sendVerificationEmail({
      //   email: domainUser.email,
      //   userId: ormUser.UserId,
      //   issuer: cmd.issuer
      // });

      return ormUser;
    });

    // 3️⃣ Map ORM → UserFlatBase DTO
    return UserDtoMapper.toDomainUserFlatBase(result);
  }
}