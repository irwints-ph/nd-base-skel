import fs from 'fs'
// import path from 'path'
// import { Sequelize } from 'sequelize'
import { sequelize } from '@Infrastructure/Core/sequelize.ts'
// import { registerAuditHooks } from "@Infrastructure/Audit/registerAuditHooks.ts";
// import { InitModels } from "@Infrastructure/Core/InitModels.ts";

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
      obj[headers[j]] = (cols[j] ?? '').trim()
    }
    rows.push(obj)
  }
  return rows
}

export async function bulkInsertSafe(tableName: string, objects: any[]) {
  if (!objects || objects.length === 0) {
    console.log(`No rows to insert into ${tableName}`)
    return false;
  }
  // // if(doAudit){
  //   // Ensure models are initialized
  //   InitModels(sequelize);
  //   // ✅ Register hooks for seeder context
  //   registerAuditHooks(sequelize);
  // // }

  console.log(`⚡ Seeding ${tableName}...`);
  const now = new Date()

  const objs = objects.map(o => {
    const processed = { ...o }

    // Convert empty strings to null for foreign key fields
    Object.keys(processed).forEach(key => {
      if (processed[key] === '' && (key.toLowerCase().includes('id') || key.toLowerCase().includes('parent'))) {
        processed[key] = null
      }
    })

    return {
      ...processed,
      CreatedOn: processed.CreatedOn ? new Date(processed.CreatedOn) : now,
      CreatedBy: processed.CreatedBy ?? 1,
      UpdatedOn: null,   // <- explicitly null
      UpdatedBy: null,   // <- explicitly null
    }
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
    console.log(`✅ Inserted ${objs.length} rows into ${tableName}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed inserting into ${tableName}:`, err);
    return false;
  }
}
