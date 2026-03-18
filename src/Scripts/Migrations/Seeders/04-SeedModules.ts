// ===================================================================
// 🧩 src/Scripts/Migrations/Seeders/04-SeedModules.ts
// ===================================================================

import ModuleMstr from "@Infrastructure/Persistence/Models/Auth/ModuleMstr.ts";
import { ModuleMstrTableName } from "@Infrastructure/Persistence/Models/Constants/DBNames.ts";
import { EnvConfig } from '@Infrastructure/Core/Config.ts'
import { setBaseDir } from "./seederHelper.ts";
import { UnitOfWork } from "@Application/UoW/UnitOfWork.ts";
import { seedCsvEntities } from "./seederTemplate.ts";

const DEFAULT_CREATED_BY = EnvConfig.admin.superRoot;;

export default async function SeedModules(
  dataDir: string,
  noErrors = true,
  fileSuffix?: string
): Promise<boolean> {
  if (!noErrors) return false;

  setBaseDir(dataDir);

    const mapToEntity = async (row: Record<string, any>, uow?: UnitOfWork): 
      Promise<ModuleMstr | null> => {
        const entity = ModuleMstr.build({
          ModuleId: Number(row.moduleId),
          ModuleName: row.moduleName || "",
          ParentId: row.parentId ? Number(row.parentId) : undefined,
          MenuLevel: Number(row.menuLevel) || 0,
          SortOrder: Number(row.sortOrder) || 0,
          IconClass: row.iconClass || "",
          ComponentName: row.componentName || "",
          ControllerName: row.controllerName || "",
          FeUrl: row.feUrl || "",
          IsParent: ["TRUE", "1", "YES"].includes((row.isParent || "").toUpperCase()),
          IsCrud: ["TRUE", "1", "YES"].includes((row.isCrud || "").toUpperCase()),
          EditComponent: row.editComponent || "",
          AddComponent: row.addComponent || "",
          TranCode: row.tranCode || undefined,
          IsAdmin: ["TRUE", "1", "YES"].includes((row.isAdmin || "").toUpperCase()),
          IsActive: ["TRUE", "1", "YES"].includes((row.isActive || "").toUpperCase()),
          CreatedBy: Number(row.createdBy) || 1,
        });
      // Optional console logging - showLineLog: false,
      console.log(
        ` → Insert to ${ModuleMstrTableName}: Module Id=${entity.ModuleId}, Module Name=${entity.ModuleName}`
      );

      return entity;
    };
  // Use the generic CSV seeder template
  return await seedCsvEntities<ModuleMstr>({
    dbModel: ModuleMstr,
    mapToEntity,
    csvFile: "modules.csv",
    fileSuffix:fileSuffix,
    dataDir,
    idFields: ["ModuleId"], // match model property names
    showLineLog: false,
  });
}
