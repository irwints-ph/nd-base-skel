// ===================================================================
// 🧩 src/scripts/migrations/seeders/seederHelper.ts
// ===================================================================
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { Model, ModelStatic, Transaction } from "sequelize";

import { UnitOfWork } from "#Application/UoW/UnitOfWork.ts";
import { AuditContext, AuditInfo } from "#Infrastructure/Audit/AuditContext.ts";

let BASE_DIR = "";

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

export function setBaseDir(baseDir: string) {
  BASE_DIR = baseDir?.trim() ?? "";
}

/**
 * Read CSV and return array of row objects
 */
export function readCsv<T = any>(dbModel: ModelStatic<any>, filePath: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(BASE_DIR, filePath);
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found: ${fullPath}`);
      return resolve([]);
    }

    const rows: T[] = [];
    fs.createReadStream(fullPath)
      .pipe(csvParser())
      .on("data", (data) => rows.push(data))
      .on("end", () => resolve(rows))
      .on("error", (err) => {
        console.error(`❌ Error reading CSV ${fullPath}:`, err);
        reject(err);
      });
  });
}

// ------------------------------------------------------------------
// Logging
// ------------------------------------------------------------------

export function logEntityInsert(
  entity: any,
  tableName: string,
  dto?: Record<string, any>,
  sensitiveFields: Set<string> = new Set(["password", "password_hash", "token", "secret"])
) {
  const items = entity
    ? Object.entries(entity.get?.() ?? entity)
    : Object.entries(dto ?? {});

  const outputFields: string[] = [];
  for (const [k, v] of items.slice(0, 2)) {
    const maskedValue = sensitiveFields.has(k.toLowerCase()) ? "***" : v;
    outputFields.push(`${k}: ${maskedValue}`);
  }

  const output = outputFields.length ? outputFields.join(", ") : "<no properties>";
  console.log(` → Insert to ${tableName}. fields: ${output}`);
}

export function logEntityError(entity: any, tableName: string, error: any) {
  console.error(` ✗ Failed to insert entity into ${tableName} with fields: ${JSON.stringify(entity)} :`, error);
}

export function logSeedingSummary(tableName: string, successCount: number, failCount: number) {
  const success = failCount === 0;
  const status = success
    ? `✅ ${tableName} seeding complete.`
    : `⚠️  ${tableName} seeding encountered errors.`;
  console.log(`${status} 🚀 Success: ${successCount}, Failed: ${failCount}\n`);
}

// ------------------------------------------------------------------
// Seeder using UnitOfWork + optional AuditContext
// ------------------------------------------------------------------

export async function seedCsvToDbMapAsync<T extends Model>({
  dbModel,
  filePath,
  mapToEntity,
  fileSuffix = "",
  showLineLog = true,
  changedBy = "SeederScript",
  doAudit = false,
}: {
  dbModel: ModelStatic<T>;
  filePath: string;
  mapToEntity: (row: Record<string, any>, uow: UnitOfWork) => Promise<T | null>;
  fileSuffix?: string;
  showLineLog?: boolean;
  changedBy?: string;
  doAudit?: boolean;
}): Promise<boolean> {

  // Append suffix if present
  let csvFile = filePath;
  if (fileSuffix?.trim()) {
    const ext = path.extname(filePath);
    const base = filePath.replace(ext, "");
    csvFile = `${base}-${fileSuffix}${ext}`;
  }

  const tableName = dbModel.name;
  console.log(`⚡ Seeding ${tableName} from: ${path.join(BASE_DIR, csvFile)}`);

  const records = await readCsv(dbModel, csvFile); // ✅ Fixed: dbModel passed
  if (!records || records.length === 0) return false;

  let successCount = 0;
  let failCount = 0;

  const runSeeder = async () => {
    return dbModel.sequelize!.transaction(async (tx: Transaction) => {
      const uow = new UnitOfWork(dbModel.sequelize!, { idFields: undefined }, tx);

      try {
        for (const dto of records) {
          let entity: T | null = null;

          try {
            entity = await mapToEntity(dto, uow);
          } catch (ex) {
            failCount++;
            logEntityError(dto, tableName, ex);
            continue;
          }

          try {
            if (entity) await entity.save({ transaction: tx });

            if (showLineLog) logEntityInsert(entity, tableName, dto);

            successCount++;
          } catch (ex) {
            failCount++;
            logEntityError(entity ?? dto, tableName, ex);
          }
        }

        // try {
        //   await uow.commit();
        // } catch (ex) {
        //   console.error(`❌ Failed to commit ${tableName}:`, ex);
        //   await uow.rollback();
        //   return false;
        // }

        return true;
      } finally {
        await uow.dispose();
      }
    });
  };

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

  logSeedingSummary(tableName, successCount, failCount);
  return result && failCount === 0;
}