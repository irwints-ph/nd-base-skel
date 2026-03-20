import fs from 'fs'
// import { sequelize } from '@Infrastructure/Core/sequelize.ts'
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";

export function readCsvSimple(filePath: string): Array<Record<string, string>> {
  if (!fs.existsSync(filePath)) return []
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0].split(',').map(h => h.trim())
  const rows: Array<Record<string, string>> = []

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',')
    const obj: Record<string, string> = {}

    for (let j = 0; j < headers.length; j++) {
      const originalKey = headers[j]
      const dbKey = DatabaseNamingConvention.getName(originalKey) // convert to DB column name
      obj[dbKey] = (cols[j] ?? '').trim()
    }

    rows.push(obj)
  }

  return rows
}

export async function bulkInsertSafe(tableName: string, objects: any[]) {
  if (!objects || objects.length === 0) {
    console.log(`No rows to insert into ${tableName}`)
    return false
  }

  console.log(`⚡ Seeding ${tableName}...`)
  const now = new Date()

  const objs = objects.map(o => {
    const processed: Record<string, any> = {}

    // Convert keys to DB naming convention and handle empty strings
    Object.keys(o).forEach(key => {
      const dbKey = DatabaseNamingConvention.getName(key)
      let value = o[key]
      if (value === '' && (key.toLowerCase().includes('id') || key.toLowerCase().includes('parent'))) {
        value = null
      }
      processed[dbKey] = value
    })

    // Add audit fields with DB naming
    processed[DatabaseNamingConvention.getName('CreatedOn')] = processed[DatabaseNamingConvention.getName('CreatedOn')] 
      ? new Date(processed[DatabaseNamingConvention.getName('CreatedOn')])
      : now
    processed[DatabaseNamingConvention.getName('CreatedBy')] = processed[DatabaseNamingConvention.getName('CreatedBy')] ?? 1
    processed[DatabaseNamingConvention.getName('UpdatedOn')] = null
    processed[DatabaseNamingConvention.getName('UpdatedBy')] = null

    return processed
  })

  // Log each row being inserted
  objs.forEach((obj, index) => {
    const keys = Object.keys(obj)
    const displayFields = keys.slice(0, 2) // Show first 2 fields
    const logMessage = displayFields.map(key => `${key}=${obj[key]}`).join(', ')
    console.log(` → Inserting into ${tableName} [${index + 1}/${objs.length}]: [${logMessage}]`)
  })

  try {
    const qi = sequelize.getQueryInterface()
    await qi.bulkInsert(tableName, objs)
    console.log(`✅ Inserted ${objs.length} rows into ${tableName}`)
    return true
  } catch (err) {
    console.error(`❌ Failed inserting into ${tableName}:`, err)
    return false
  }
}
