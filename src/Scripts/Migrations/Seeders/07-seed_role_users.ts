import path from 'path'
import { readCsvSimple, bulkInsertSafe } from './_util.ts'

export default async function seed_role_users(dataDir: string, noErrors: boolean): Promise<boolean> {
  const tableName = 'RoleUser';
  try {
    const file = path.join(dataDir, 'role_users.csv')
    const rows = readCsvSimple(file)
    noErrors = await bulkInsertSafe(tableName, rows)
  } catch (err) {
    console.error(`Error seeding ${tableName}`, err)
    noErrors = false;
  }
  return noErrors;
}
