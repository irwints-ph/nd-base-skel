// ===================================================================
// 🧩 src/scripts/migrations/seeders/seedSsoTypes.ts
// ===================================================================

import SsoType from "#Infrastructure/Persistence/Models/Base/SsoType.ts";
import { SsoTypeTableName } from "#Infrastructure/Persistence/Models/Constants/DBNames.ts";
import { seedCsvEntities } from "./seederTemplate.ts";
import { setBaseDir } from "./seederHelper.ts";
import { UnitOfWork } from "#Application/UoW/UnitOfWork.ts";
import { AppTime } from "#Infrastructure/Core/AppTime.ts";

// ------------------------------------------------------------------
// Seeder function
// ------------------------------------------------------------------
export async function seedSsoTypes(
  dataDir: string,
  noErrors = true
): Promise<boolean> {

  if (!noErrors) return false;

  setBaseDir(dataDir);

  // ----------------------------------------------------------
  // Map CSV row → Sequelize entity
  // ----------------------------------------------------------
  const mapToEntity = async (
    row: Record<string, any>,
    uow?: UnitOfWork,
  ): Promise<SsoType | null> => {

    if (!uow) {
      throw new Error("UnitOfWork is required for seeding SsoType");
    }

    const entity = SsoType.build({
      TypeId: Number(row.TypeId),
      TypeText: row.TypeText,
      CreatedBy: Number(row.CreatedBy ?? 1),
      CreatedOn: AppTime.utcNow(),
    });

    console.log(
      ` → Insert to ${SsoTypeTableName}: ` +
      `TypeId=${entity.TypeId}, TypeText=${entity.TypeText}`
    );

    return entity;
  };

  // ----------------------------------------------------------
  // Run seeder engine
  // ----------------------------------------------------------
  return await seedCsvEntities<SsoType>({
    dbModel: SsoType,
    mapToEntity,
    csvFile: "sso_types.csv",
    dataDir,
    idFields: ["TypeId"],
    showLineLog: false,
  });
}