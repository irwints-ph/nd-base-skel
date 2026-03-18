// ===================================================================
// 🧩 src/scripts/migrations/seeders/seederTemplate.ts
// ===================================================================

import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Model, ModelStatic } from "sequelize";

import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";
import { AuditContext, AuditInfo } from "@Infrastructure/Audit/AuditContext.ts";
import { UnitOfWork } from "@Application/UoW/UnitOfWork.ts";
import { getPrimaryKeyFields } from "./seederUtils.ts";

import { registerAuditHooks } from "@Infrastructure/Audit/registerAuditHooks.ts";
import { InitModels } from "@Infrastructure/Core/InitModels.ts";

import {
  setBaseDir,
  readCsv,
  logEntityInsert,
  logEntityError,
  logSeedingSummary,
} from "./seederHelper.ts";

// ------------------------------------------------------------------
// 🔧 CONFIG
// ------------------------------------------------------------------
export const doAudit = false;
const showAuditLogs = true; //Will show log only if doAudit is true and this is true

// ------------------------------------------------------------------
// 🧱 MAIN SEED FUNCTION
// ------------------------------------------------------------------
export async function seedCsvEntities<T extends Model>({
  dbModel,
  mapToEntity,
  csvFile,
  dataDir,
  idFields,
  fileSuffix,
  changedBy = "SeederScript",
  showLineLog = true,
}: {
  dbModel: ModelStatic<T>;
  mapToEntity: (row: any, uow?: UnitOfWork) => Promise<T | null>;
  csvFile: string;
  dataDir: string;
  idFields?: string[];
  fileSuffix?: string;
  changedBy?: string;
  showLineLog?: boolean;
}): Promise<boolean> {

  // // Ensure models are initialized
  // InitModels(sequelize);

  // // ✅ Register hooks for seeder context
  // registerAuditHooks(sequelize);

  setBaseDir(dataDir);

  // Infer PK fields if not provided
  if (!idFields || idFields.length === 0) {
    idFields = getPrimaryKeyFields(dbModel);
  }

  // Handle file suffix
  if (fileSuffix?.trim()) {
    const ext = path.extname(csvFile);
    const base = csvFile.replace(ext, "");
    csvFile = `${base}-${fileSuffix}${ext}`;
  }

  const tableName = (dbModel as any).tableName || dbModel.name;
  const fullPath = path.join(dataDir, csvFile);

  console.log(`⚡ Seeding ${tableName} from ${fullPath}`);

  // ✅ Await readCsv and handle null/empty
  const records = await readCsv(dbModel, csvFile);
  if (!records || records.length === 0) {
    console.warn(`⚠️ No records found in CSV: ${fullPath}`);
    return false;
  }

  let successCount = 0;
  let failCount = 0;

  // ------------------------------------------------------------------
  // 🧠 AUDIT CONTEXT (BATCH-SCOPED)
  // ------------------------------------------------------------------
  const runSeeder = async () => {
    const tx = await sequelize.transaction(); // ✅ manual transaction
    const uow = new UnitOfWork(
      sequelize,
      {
        idFields,
        showlog: doAudit ? showAuditLogs : doAudit,
      },
      tx
    );

    try {
      for (const row of records) {
        let entity: T | null = null;

        // -----------------------------
        // MAP ROW → ENTITY
        // -----------------------------
        try {
          entity = await mapToEntity(row, uow);
        } catch (ex) {
          failCount++;
          logEntityError(row, dbModel.name, ex);
          continue;
        }

        // -----------------------------
        // ADD TO SESSION
        // -----------------------------
        try {
          if (entity) {
            await entity.save({ transaction: tx });

            // ✅ important for audit tracking
            uow.trackNew?.(entity);
          }

          if (showLineLog) {
            logEntityInsert(entity, dbModel.name, row);
          }

          successCount++;
        } catch (ex) {
          failCount++;
          logEntityError(entity ?? row, dbModel.name, ex);
        }
      }

      // ✅ NOW THIS IS SAFE
      await uow.commit();   // ← audit happens here
      // await tx.commit();    // ← actual DB commit:Removed already done in uow.commit

      return true;
    } catch (ex) {
      console.error(`❌ Failed to commit ${dbModel.name}:`, ex);
      await tx.rollback();
      return false;
    } finally {
      await uow.dispose();
    }
  };

  // ------------------------------------------------------------------
  // 🚀 EXECUTION (WITH OR WITHOUT AUDIT)
  // ------------------------------------------------------------------
  let result: boolean;

  if (doAudit) {
    const auditInfo: AuditInfo = {
      changedBy,
      correlationId: `SEED-${uuidv4()}`,
    };

    result = await AuditContext.run(auditInfo, runSeeder);
  } else {
    result = await runSeeder();
  }

  // ------------------------------------------------------------------
  // 📊 SUMMARY
  // ------------------------------------------------------------------
  logSeedingSummary(dbModel.name, successCount, failCount);

  return result && failCount === 0;
}