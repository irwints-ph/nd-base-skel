// ===================================================================
// 🧩 src/Scripts/Migrations/Seeders/05-SeedRoles.ts
// ===================================================================

import RoleMstr from "#Infrastructure/Persistence/Models/Auth/RoleMstr.ts";
import { RoleMstrTableName } from "#Infrastructure/Persistence/Models/Constants/DBNames.ts";
import { seedCsvEntities } from "./seederTemplate.ts";
import { UnitOfWork } from "#Application/UoW/UnitOfWork.ts";
import { EnvConfig } from "#Infrastructure/Core/Config.ts";

const DEFAULT_CREATED_BY = EnvConfig.admin?.superRoot ?? 1;

export default async function SeedRoles(
  dataDir: string,
  noErrors = true,
  fileSuffix?: string
): Promise<boolean> {
  if (!noErrors) return false;

  const mapToEntity = async (
    row: Record<string, any>,
    uow?: UnitOfWork
  ): Promise<RoleMstr | null> => {
    const entity = RoleMstr.build({
      RoleId: row.roleId ? Number(row.roleId) : undefined,
      RoleName: row.roleName,
      RoleDescription: row.roleDescription,
      ParentId: row.parentId ? Number(row.parentId) : null,

      IsAdmin: ["TRUE", "1", "YES"].includes(
        String(row.isAdmin ?? "").toUpperCase()
      ),

      IsActive: ["TRUE", "1", "YES"].includes(
        String(row.isActive ?? "").toUpperCase()
      ),

      CreatedBy: Number(row.createdBy ?? DEFAULT_CREATED_BY),
    });

    console.log(
      ` → Role seed: ID=${entity.RoleId ?? "(auto)"}, Name=${entity.RoleName}`
    );

    return entity;
  };

  return await seedCsvEntities<RoleMstr>({
    dbModel: RoleMstr,
    mapToEntity, // ✅ must be async + return Promise
    csvFile: "roles.csv",
    fileSuffix,
    dataDir,
    idFields: ["RoleId"],
    showLineLog: false,
  });
}

// // ===================================================================
// // 🧩 src/Scripts/Migrations/Seeders/05-SeedRoles.ts
// // ===================================================================

// // No Audit
// import path from 'path'
// import { readCsvSimple, bulkInsertSafe } from './_util.ts'
// import { RoleMstrTableName } from "#Infrastructure/Persistence/Models/Constants/DBNames.ts";

// export default async function SeedRoles(dataDir: string, noErrors: boolean): Promise<boolean> {
//   const tableName = RoleMstrTableName;
//   try {
//     const file = path.join(dataDir, 'roles.csv')
//     const rows = readCsvSimple(file)
//     const rowsToInsert = rows.map(r => ({
//       ...r,
//       CreatedOn: new Date(),
//       CreatedBy: 1,
//     }))
//     noErrors = await bulkInsertSafe(tableName, rowsToInsert)
//   } catch (err) {
//     console.error(`Error seeding ${tableName}`, err)
//     noErrors = false;
//   }
//   return noErrors;
// }
