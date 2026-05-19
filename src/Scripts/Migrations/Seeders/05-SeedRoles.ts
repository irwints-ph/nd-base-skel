// ===================================================================
// 🧩 src/Scripts/Migrations/Seeders/05-SeedRoles.ts
// ===================================================================

// No Audit
import path from 'path'
import { readCsvSimple, bulkInsertSafe } from './_util.ts'
import { RoleMstrTableName } from "@Infrastructure/Persistence/Models/Constants/DBNames.ts";

export default async function SeedRoles(dataDir: string, noErrors: boolean): Promise<boolean> {
  const tableName = RoleMstrTableName;
  try {
    const file = path.join(dataDir, 'roles.csv')
    const rows = readCsvSimple(file)
    const rowsToInsert = rows.map(r => ({
      ...r,
      CreatedOn: new Date(),
      CreatedBy: 1,
    }))
    noErrors = await bulkInsertSafe(tableName, rowsToInsert)
  } catch (err) {
    console.error(`Error seeding ${tableName}`, err)
    noErrors = false;
  }
  return noErrors;
}
