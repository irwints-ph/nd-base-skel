// ===================================================================
// 🧩 src/scripts/migrations/seeders/seedUsers.ts
// ===================================================================

import { seedCsvEntities } from "./seederTemplate.ts";
import { buildUser } from "@Application/Services/Base/UserFactory.ts";
import { UserRepository } from "@Infrastructure/Persistence/Repositories/Base/UserRepository.ts";
import { mapCreateUserSeed } from "./03-CreateUserSeedMap.ts";
import { UnitOfWork } from "@Application/UoW/UnitOfWork.ts";
import { User } from "@Domain/Entities/Base/User/User.ts";
import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
import { Transaction } from "sequelize";

// ------------------------------------------------------------------
// Seeder
// ------------------------------------------------------------------
export async function SeedUsers(
  dataDir: string,
  noErrors = true,
  fileSuffix?: string, 
  transaction?: Transaction
): Promise<boolean> {

  if (!noErrors) return false;

  const DEFAULT_CREATED_BY = 1;

  const mapToEntity = async (
    row: Record<string, any>,
    uow?: UnitOfWork
  ): Promise<UserMstr | null> => {

    if (!uow) throw new Error("UnitOfWork is required for user seeding");

    // -----------------------------
    // MAP CSV → DTO
    // -----------------------------
    const dto = mapCreateUserSeed(row);

    // -----------------------------
    // BUILD DOMAIN USER
    // -----------------------------
    const domainUser = await buildUser({
      username: dto.username,
      password: dto.password,
      firstname: dto.firstname,
      lastname: dto.lastname,
      createdBy: DEFAULT_CREATED_BY,
      email: dto.email,
      // isEmailValidated: dto.active,
    });

    // -----------------------------
    // SAVE VIA REPOSITORY (UoW)
    // -----------------------------
    const repo = new UserRepository();
    // repo.session = uow.transaction;

    const ormUser = await repo.add(domainUser,uow.transaction);

    // -----------------------------
    // LOGGING
    // -----------------------------
    console.log(
      ` → Insert User: username=${domainUser.username}, ` +
      `name=${domainUser.profile?.fullname ?? "N/A"}, ` +
      `email=${domainUser.getPrimaryEmail?.() ?? dto.email}`
    );

    // IMPORTANT:
    // Return UserMstr so seederTemplate Save Audit if flag is set
    return ormUser;
  };

  // ------------------------------------------------------------------
  // RUN SEEDER TEMPLATE
  // ------------------------------------------------------------------
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