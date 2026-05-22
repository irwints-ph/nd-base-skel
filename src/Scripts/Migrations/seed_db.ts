// src/scripts/migrations/seed_db.ts
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { runSeeders } from "./seed_runner.ts";

// ==============================
// Load dotenv FIRST
// ==============================
const seederFile = fileURLToPath(import.meta.url);
const seederDir = path.dirname(seederFile);

dotenv.config({ path: path.resolve(seederDir, "../../../.env") });

// ==============================
// Imports AFTER dotenv
// ==============================
import { createDatabaseIfNotExists } from "#Infrastructure/Core/sequelize.ts";
import { sequelize } from "#Infrastructure/Persistence/AppDBContext.ts";
import { InitModels } from "#Infrastructure/Core/InitModels.ts";
import { EnvConfig } from "#Infrastructure/Core/ConfigLoader.ts";

// ==============================
// Helpers
// ==============================
function deleteSqliteFile(dbName: string) {
  if (!dbName || dbName === ":memory:") return;

  if (fs.existsSync(dbName)) {
    console.log(`🗑 Deleting SQLite DB file: ${dbName}`);
    fs.unlinkSync(dbName);
  }
}

// ==============================
// 🔥 NEW: Programmatic API (for Jest)
// ==============================
export async function seedDatabase(options: {
  createDb?: boolean;
  dropDbOnly?: boolean;
  reset?: boolean;
  dataDir: string;
  noSeed?: boolean;
  cs?: string;
}) {
  const {
    createDb = false,
    dropDbOnly = false,
    reset = false,
    dataDir,
    noSeed = false,
    cs,
  } = options;

  console.log(`Using data dir: ${dataDir}`);
  if (cs) console.log(`CSV suffix: ${cs}`);

  const dbSettings = EnvConfig.database;
  const isSqlite = dbSettings.type === "sqlite";
  console.log("dbSettings.type", dbSettings.type,"In-Momory", dbSettings.isInMemory);
  if (reset && EnvConfig.ENVIRONMENT === "production") {
    throw new Error("❌ --reset is disabled in production");
  }

  try {
    // =========================
    // RESET
    // =========================
    if (reset) {
      console.log("🔁 Resetting database...", dbSettings.type, "On", dbSettings.host, dbSettings.name, "In-Memory:", dbSettings.isInMemory);

      if (isSqlite) {
        deleteSqliteFile(dbSettings.name);
      } else {
        await sequelize.getQueryInterface().dropAllTables();
      }

      await createDatabaseIfNotExists(dbSettings);
      InitModels(sequelize);

      await sequelize.authenticate();
      await sequelize.sync({ force: true });

      console.log("✅ Database recreated");
    }

    // =========================
    // DROP ONLY
    // =========================
    if (dropDbOnly && !reset) {
      await sequelize.getQueryInterface().dropAllTables();
      console.log("✅ Dropped all tables");
      return;
    }

    // =========================
    // CREATE
    // =========================
    if (createDb && !reset) {
      await sequelize.getQueryInterface().dropAllTables();

      await createDatabaseIfNotExists(dbSettings);
      InitModels(sequelize);

      await sequelize.authenticate();
      await sequelize.sync({ alter: true });

      console.log("✅ Database schema synced");
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
    if(!dbSettings.isInMemory){
      await sequelize.close();
      console.log("✅ seeed_db: sequelize.close");
    }
  } catch (err) {
    console.error("❌ Unhandled error:", err);
    throw err; // ❗ important for Jest
  }
}