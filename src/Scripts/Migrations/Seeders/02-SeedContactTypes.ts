// ===================================================================
// 🧩 src/Scripts/Migrations/Seeders/02-SeedContactTypes.ts
// ===================================================================

import ContactType from "@Infrastructure/Persistence/Models/Base/ContactType.ts";
import { ContactTypeTableName } from "@Infrastructure/Persistence/Models/Constants/DBNames.ts";
import { EnvConfig } from '@Infrastructure/Core/Config.ts'
import { setBaseDir } from "./seederHelper.ts";
import { UnitOfWork } from "@Application/UoW/UnitOfWork.ts";
import { seedCsvEntities } from "./seederTemplate.ts";
import { Transaction } from "sequelize";

const DEFAULT_CREATED_BY = EnvConfig.admin.superRoot;;
export default async function SeedContactTypes(
  dataDir: string,
  noErrors: boolean,
  fileSuffix?: string, 
): Promise<boolean> {
  if (!noErrors) return false;

  setBaseDir(dataDir);

  // Map CSV row → Sequelize entity
  const mapToEntity = async (row: Record<string, any>, uow?: UnitOfWork): Promise<ContactType | null> => {
    const entity = ContactType.build({
      ContactTypeId: Number(row["ContactTypeId"]),
      ContactTypeText: row["ContactTypeText"],
      CreatedBy: DEFAULT_CREATED_BY, //Number(row["CreatedBy"]),
    });

    // Optional console logging
    console.log(
      ` → Insert to ${ContactTypeTableName}: ContactTypeId=${entity.ContactTypeId}, ContactTypeText=${entity.ContactTypeText}`
    );

    return entity;
  };

  // Use the generic CSV seeder template
  return await seedCsvEntities<ContactType>({
    dbModel: ContactType, // correct type: ModelStatic<SsoType>
    mapToEntity,
    csvFile: "contact_types.csv",
    fileSuffix:fileSuffix,
    dataDir,
    idFields: ["ContactTypeId"], // match model property names
    showLineLog: false,
  });
}
