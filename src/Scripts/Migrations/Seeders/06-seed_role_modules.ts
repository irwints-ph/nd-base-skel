import path from 'path'
import { readCsvSimple, bulkInsertSafe } from './_util.ts'

export default async function seed_role_modules(dataDir: string, noErrors: boolean, fileSuffix?: string): Promise<boolean> {
  const tableName = 'RoleModule';
  try {
    const fileName = fileSuffix ? `role_modules-${fileSuffix}.csv` : 'role_modules.csv'
    const file = path.join(dataDir, fileName)
    const rows = readCsvSimple(file)
    noErrors = await bulkInsertSafe(tableName, rows)
  } catch (err) {
    console.error(`Error seeding ${tableName}`, err)
    noErrors = false;
  }
  return noErrors;
}
