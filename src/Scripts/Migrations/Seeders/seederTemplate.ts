// ===================================================================
// 🧩 src/scripts/migrations/seeders/seederTemplate.ts
// ===================================================================
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Model, ModelStatic, Transaction } from "sequelize";

import { sequelize, DatabaseConfig } from "@Infrastructure/Persistence/AppDBContext.ts";
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
const showAuditLogs = doAudit ? true : false;

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
  transaction, // optional external transaction
}: {
  dbModel: ModelStatic<T>;
  mapToEntity: (row: any, uow?: UnitOfWork) => Promise<T | null>;
  csvFile: string;
  dataDir: string;
  idFields?: string[];
  fileSuffix?: string;
  changedBy?: string;
  showLineLog?: boolean;
  transaction?: Transaction;
}): Promise<boolean> {

  // Initialize models and audit hooks if needed
  if (doAudit) {
    InitModels(sequelize);
    registerAuditHooks(sequelize);
  }

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

  const records = await readCsv(dbModel, csvFile);
  if (!records || records.length === 0) {
    console.log("Current working directory:", process.cwd());
    console.warn(`⚠️  No records found in CSV: ${fullPath}`);
    return false;
  }

  let successCount = 0;
  let failCount = 0;

  // ------------------------------------------------------------------
  // 🧠 TRANSACTION HANDLING
  // ------------------------------------------------------------------
  const runSeeder = async () => {
    // For SQLite in-memory: always use single transaction
    const isInMemory = DatabaseConfig.isInMemory && DatabaseConfig.type === "sqlite";
    const tx = transaction ?? (isInMemory ? await sequelize.transaction() : await sequelize.transaction());
    const isExternalTx = !!transaction;

    const uow = new UnitOfWork(
      sequelize,
      { idFields, showlog: showAuditLogs },
      tx
    );

    try {
      for (const row of records) {
        let entity: T | null = null;

        // Map row → entity
        try {
          entity = await mapToEntity(row, uow);
        } catch (ex) {
          failCount++;
          logEntityError(row, dbModel.name, ex);
          continue;
        }

        // Add entity to DB
        try {
          if (entity) await entity.save({ transaction: tx });
          if (showLineLog) logEntityInsert(entity, dbModel.name, row);
          // uow.trackNew?.(entity);
          successCount++;
        } catch (ex) {
          failCount++;
          logEntityError(entity ?? row, dbModel.name, ex);
        }
      }

      if (!isExternalTx) {
        await tx.commit();
      }

      return true;
    } catch (ex) {
      console.error(`❌ Failed to commit ${dbModel.name}:`, ex);
      if (!isExternalTx) {
        await tx.rollback();
      }
      return false;
    } finally {
      await uow.dispose();
    }
  };

  // ------------------------------------------------------------------
  // 🚀 RUN WITH OR WITHOUT AUDIT CONTEXT
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