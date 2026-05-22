// ===================================================================
// 🧩 src/Scripts/Migrations/Seeders/06-SeedRoleUsers.ts
// ===================================================================

import RoleUserMstr from "#Infrastructure/Persistence/Models/Auth/RoleUserMstr.ts";
import { RoleUserTableName } from "#Infrastructure/Persistence/Models/Constants/DBNames.ts";
import { seedCsvEntities } from "./seederTemplate.ts";
import { UnitOfWork } from "#Application/UoW/UnitOfWork.ts";

export default async function SeedRoleUsers(
  dataDir: string,
  noErrors = true,
  fileSuffix?: string
): Promise<boolean> {
  if (!noErrors) return false;

  const mapToEntity = async (
    row: Record<string, any>,
    uow?: UnitOfWork
  ): Promise<RoleUserMstr | null> => {
    const entity = RoleUserMstr.build({
      RoleId: row.roleId ? Number(row.roleId) : undefined,
      UserId: row.userId ? Number(row.userId) : undefined,

      IsActive: ["TRUE", "1", "YES"].includes(
        String(row.isActive ?? "").toUpperCase()
      ),
    });

    console.log(
      ` → RoleUser seed: RoleId=${entity.RoleId}, UserId=${entity.UserId}`
    );

    return entity;
  };

  return await seedCsvEntities<RoleUserMstr>({
    dbModel: RoleUserMstr,
    mapToEntity,
    csvFile: "role_users.csv",
    fileSuffix,
    dataDir,
    idFields: ["RoleId", "UserId"], // composite key if applicable
    showLineLog: false,
  });
}

// import path from 'path'
// import { readCsvSimple, bulkInsertSafe } from './_util.ts'
// import { RoleUserTableName } from "#Infrastructure/Persistence/Models/Constants/DBNames.ts";

// export default async function seed_role_users(
//   dataDir: string, 
//   noErrors: boolean, 
// ): Promise<boolean> {
//   const tableName = RoleUserTableName;
//   try {
//     const file = path.join(dataDir, 'role_users.csv')
//     const rows = readCsvSimple(file)
//     noErrors = await bulkInsertSafe(tableName, rows)
//   } catch (err) {
//     console.error(`Error seeding ${tableName}`, err)
//     noErrors = false;
//   }
//   return noErrors;
// }
