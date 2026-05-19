// ===================================================================
// 🧩 src/scripts/migrations/seeders/seedSsoTypes.ts
// ===================================================================
import SsoType  from "@Infrastructure/Persistence/Models/Base/SsoType.ts";
import { SsoTypeTableName } from "@Infrastructure/Persistence/Models/Constants/DBNames.ts";
import { seedCsvEntities } from "./seederTemplate.ts";
import { setBaseDir } from "./seederHelper.ts";
import { UnitOfWork } from "@Application/UoW/UnitOfWork.ts";
import { Transaction } from "sequelize";

// ------------------------------------------------------------------
// Seeder function
// ------------------------------------------------------------------
export async function seedSsoTypes(dataDir: string, noErrors = true): Promise<boolean> {
  if (!noErrors) return false;

  setBaseDir(dataDir);

  // Map CSV row → Sequelize entity
  const mapToEntity = async (row: Record<string, any>, uow?: UnitOfWork): Promise<SsoType | null> => {
    const entity = SsoType.build({
      TypeId: Number(row["TypeId"]),
      TypeText: row["TypeText"],
      CreatedBy: Number(row["CreatedBy"]),
    });

    // Optional console logging
    console.log(
      ` → Insert to ${SsoTypeTableName}: TypeId=${entity.TypeId}, TypeText=${entity.TypeText}`
    );

    return entity;
  };

  // Use the generic CSV seeder template
  return await seedCsvEntities<SsoType>({
    dbModel: SsoType, // correct type: ModelStatic<SsoType>
    mapToEntity,
    csvFile: "sso_types.csv",
    dataDir,
    idFields: ["TypeId"], // match model property names
    showLineLog: false,
  });
}