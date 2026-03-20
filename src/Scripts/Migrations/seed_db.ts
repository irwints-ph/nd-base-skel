// src/scripts/migrations/seed_db.ts
import path from "path"
import fs from "fs"
import { fileURLToPath } from "url"
import dotenv from "dotenv"

import { parseArgs, printHelp, isEmptyArgs } from "./parameter_parser.ts"
import { runSeeders } from "./seed_runner.ts"

// ==============================
// Load dotenv FIRST
// ==============================
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, "../../../.env") })

// ==============================
// Imports AFTER dotenv
// ==============================
import { createDatabaseIfNotExists } from "../../04-Infrastructure/Core/sequelize.ts"
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";
import { InitModels } from "04-Infrastructure/Core/InitModels.ts"
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts"

// ==============================
// Helpers
// ==============================
function deleteSqliteFile(dbName: string) {
  if (!dbName || dbName === ":memory:") return

  if (fs.existsSync(dbName)) {
    console.log(`🗑 Deleting SQLite DB file: ${dbName}`)
    fs.unlinkSync(dbName)
  }
}

// ==============================
// Main
// ==============================
async function main() {
  const args = parseArgs(process.argv)

  if (args.help || isEmptyArgs(args)) {
    printHelp()
    return
  }

  const { createDb, dropDbOnly, reset, dataDir, noSeed, cs } = args

  console.log(`Using data dir: ${dataDir}`)
  if (cs) console.log(`CSV suffix: ${cs}`)

  const dbSettings = EnvConfig.database
  const isSqlite = dbSettings.type === "sqlite"

  if (reset && EnvConfig.ENVIRONMENT === "production") {
    throw new Error("❌ --reset is disabled in production")
  }

  try {
    // =========================
    // RESET
    // =========================
    if (reset) {
      console.log("🔁 Resetting database...")

      if (isSqlite) {
        deleteSqliteFile(dbSettings.name)
      } else {
        await sequelize.getQueryInterface().dropAllTables()
      }

      await createDatabaseIfNotExists(dbSettings)
      InitModels(sequelize)

      await sequelize.authenticate()
      await sequelize.sync({ force: true })

      console.log("✅ Database recreated")
    }

    // =========================
    // DROP ONLY
    // =========================
    if (dropDbOnly && !reset) {
      await sequelize.getQueryInterface().dropAllTables()
      console.log("✅ Dropped all tables")
      return
    }

    // =========================
    // CREATE
    // =========================
    if (createDb && !reset) {
      await sequelize.getQueryInterface().dropAllTables()

      await createDatabaseIfNotExists(dbSettings)
      InitModels(sequelize)

      await sequelize.authenticate()
      await sequelize.sync({ alter: true })

      console.log("✅ Database schema synced")
    }

    // =========================
    // SEED
    // =========================
    if (!noSeed && (reset || createDb)) {
      const success = await runSeeders(dataDir, cs);

      if (!success) {
        throw new Error("❌ Seeding failed");
      }

      console.log("✅ Database seeding complete");
    }

    await sequelize.close();
  } catch (err) {
    console.error("❌ Unhandled error:", err);
    process.exit(1);
  }
}

// ==============================
// Run
// ==============================
main()

export default main