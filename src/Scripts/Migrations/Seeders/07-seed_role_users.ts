import path from 'path'
import { readCsvSimple, bulkInsertSafe } from './_util.ts'
import { RoleUserTableName } from "@Infrastructure/Persistence/Models/Constants/DBNames.ts";
import { Transaction } from "sequelize";

export default async function seed_role_users(dataDir: string, noErrors: boolean, 
  transaction?: Transaction): Promise<boolean> {
  const tableName = RoleUserTableName;
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
