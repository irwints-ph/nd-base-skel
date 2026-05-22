import { seedCsvEntities } from "./seederTemplate.ts";
import { buildUser } from "#Application/Services/Base/UserFactory.ts";
import { UserRepository } from "#Infrastructure/Persistence/Repositories/Base/UserRepository.ts";
import { mapCreateUserSeed } from "./03-CreateUserSeedMap.ts";
import { UnitOfWork } from "#Application/UoW/UnitOfWork.ts";
import UserMstr from "#Infrastructure/Persistence/Models/Base/UserMstr.ts";
import UserMapper from "#Infrastructure/Persistence/Mappers/Base/UserMapper.ts";

export async function SeedUsers(
  dataDir: string,
  noErrors = true,
  fileSuffix?: string,
): Promise<boolean> {

  if (!noErrors) return false;

  const DEFAULT_CREATED_BY = 1;

  const mapToEntity = async (
    row: Record<string, any>,
    uow?: UnitOfWork,
  ): Promise<UserMstr | null> => {

    if (!uow) {
      throw new Error("UnitOfWork is required for user seeding");
    }

    // 1️⃣ Map CSV → DTO
    const dto = mapCreateUserSeed(row);

    // 2️⃣ Build DOMAIN USER
    const domainUser = await buildUser({
      username: dto.username,
      password: dto.password,
      firstname: dto.firstname,
      lastname: dto.lastname,
      createdBy: DEFAULT_CREATED_BY,
      email: dto.email,
      isEmailValidated: dto.active ?? false,
    });

    // 3️⃣ Persist via repository
    const repo = new UserRepository();
    const ormUser = await repo.create(domainUser, uow.transaction);

    // 4️⃣ Logging
    console.log(
      ` → Insert User: ` +
        `username=${domainUser.username}, ` +
        `userId=${ormUser.id}, ` +
        `email=${domainUser.getPrimaryEmail?.() ?? dto.email}`
    );

    return UserMapper.toOrm(ormUser); // 👈 IMPORTANT: return ORM, NOT domain
  };

  return await seedCsvEntities<UserMstr>({
    dbModel: UserMstr,
    mapToEntity,
    csvFile: "users.csv",
    dataDir,
    fileSuffix,
    idFields: ["UserId"],
    showLineLog: false,
  });
}