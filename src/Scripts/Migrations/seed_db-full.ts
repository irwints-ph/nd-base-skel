// src/scripts/migrations/seed_db.ts
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

// ==============================
// 1️⃣ Load dotenv before anything else
// ==============================
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure correct path to root .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

// ==============================
// 2️⃣ Import after dotenv is loaded
// ==============================
import { sequelize, createDatabaseIfNotExists  } from "../../04-Infrastructure/Core/sequelize.ts";
// import { Settings } from '../../01-infrastructure/config/settings.ts'
// import { initModels } from '../../01-infrastructure/db/initModels.ts'

// ==============================
// 3️⃣ Seeders
// ==============================
// import { seedSsoTypes } from "./Seeders/01-SeedSsoTypes.ts";
import { InitModels } from '04-Infrastructure/Core/InitModels.ts'
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import seedSsoTypes from './Seeders/01-SeedSsoTypes.ts'
import seed_contact_types from './Seeders/02-seed_contact_types.ts'
import seed_users from './Seeders/03-seed_users.ts'

import seed_modules from './Seeders/04-seed_modules.ts'
import seed_roles from './Seeders/05-seed_roles.ts'
import seed_role_users from './Seeders/07-seed_role_users.ts'
import seed_role_modules from './Seeders/06-seed_role_modules.ts'

// ==============================
// 4️⃣ Defaults & arg parser
// ==============================
// const DEFAULT_DATA_DIR = path.resolve(__dirname, '../../../../api/Scripts/DataSeed')
const DEFAULT_DATA_DIR = "src/Scripts/DataSeed";
// const DEFAULT_DATA_DIR = path.resolve(__dirname, './DataSeed')

function parseArgs(argv: string[]) {
  const args = {
    createDb: false,
    dropDbOnly: false,
    reset: false,
    dataDir: DEFAULT_DATA_DIR,
    noSeed: false,
    cs: undefined as string | undefined,
  }

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    switch (a) {
      case '--create-db':
        args.createDb = true
        break
      case '--drop-db-only':
        args.dropDbOnly = true
        break
      case '--reset':
        args.reset = true
        break
      case '--data-dir':
        if (i + 1 < argv.length) args.dataDir = path.resolve(argv[++i])
        break
      case '--no-seed':
        args.noSeed = true
        break
      case '-cs':
        if (i + 1 < argv.length) args.cs = argv[++i]
        break
    }
  }

  return args
}

// ==============================
// 5️⃣ Helpers
// ==============================
function deleteSqliteFile(dbName: string) {
  if (!dbName || dbName === ':memory:') return

  if (fs.existsSync(dbName)) {
    console.log(`🗑 Deleting SQLite DB file: ${dbName}`)
    fs.unlinkSync(dbName)
  } else {
    console.log('ℹ SQLite DB file not found, skipping delete')
  }
}

// ==============================
// 6️⃣ Main function
// ==============================
async function main() {
  const { createDb, dropDbOnly, reset, dataDir, noSeed, cs } =
    parseArgs(process.argv)

  console.log(`Using data dir: ${dataDir}`)
  if (cs) console.log(`CSV suffix: ${cs}`)

  // const dbSettings = Settings.Database()
  const dbSettings = EnvConfig.database;
  const isSqlite = dbSettings.type === 'sqlite'

  // Safety guard
  if (reset && EnvConfig.ENVIRONMENT === 'production') {
    throw new Error('❌ --reset is disabled in production')
  }

  try {
    // --------------------------------------------------
    // RESET (drop + create)
    // --------------------------------------------------
    if (reset) {
      console.log('🔁 Resetting database...')

      if (isSqlite) {
        deleteSqliteFile(dbSettings.name)
      } else {
        console.log('Dropping all tables...')
        await sequelize.getQueryInterface().dropAllTables()
      }

      await createDatabaseIfNotExists(dbSettings)
      InitModels(sequelize)

      await sequelize.authenticate()
      console.log('✅ Database connected')

      await sequelize.sync({ force: true })
      console.log('✅ Database recreated')
    }

    // --------------------------------------------------
    // DROP ONLY
    // --------------------------------------------------
    if (dropDbOnly && !reset) {
      console.log('Dropping all tables...')
      await sequelize.getQueryInterface().dropAllTables()
      console.log('✅ Dropped all tables')
      return
    }

    // --------------------------------------------------
    // CREATE / ALTER
    // --------------------------------------------------
    if (createDb && !reset) {
      console.log('🗑️  Dropping existing tables...');
      await sequelize.getQueryInterface().dropAllTables()
      console.log('📦 Creating tables...');
      await createDatabaseIfNotExists(dbSettings)
      InitModels(sequelize)

      await sequelize.authenticate()
      console.log('✅ Database connected')

      await sequelize.sync({ alter: true })
      console.log('✅ Database schema synced')
    }

    // --------------------------------------------------
    // SEED
    // --------------------------------------------------
    if (!noSeed && (reset || createDb)) {
      let noErrors = true
      noErrors = await seedSsoTypes(dataDir, noErrors);
      if (noErrors) noErrors = await seed_contact_types(dataDir, noErrors)
      if (noErrors) noErrors = await seed_users(dataDir, noErrors)
      if (noErrors) noErrors = await seed_modules(dataDir, noErrors, cs)
      if (noErrors) noErrors = await seed_roles(dataDir, noErrors)
      if (noErrors) noErrors = await seed_role_modules(dataDir, noErrors, cs)
      if (noErrors) noErrors = await seed_role_users(dataDir, noErrors)

      console.log('✅ Database seeding complete')
    }
    
    await sequelize.close()
  } catch (err) {
    console.error('❌ Unhandled error:', err)
    process.exit(1)
  }
}

// ==============================
// 7️⃣ Run
// ==============================
main()

export default main
