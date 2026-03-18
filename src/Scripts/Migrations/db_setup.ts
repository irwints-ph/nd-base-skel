// src/Scripts/Migrations/dbSetup.ts
import { Sequelize, Model } from "sequelize";
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import {
  UserMstr,
  UserProfile,
  SsoType,
  SsoKey,
  ContactType,
  ContactMstr,
  ApiClient,
  Otps,
  AuditLogs,
  DefaultConfigurationMstr,
} from "@Infrastructure/Persistence/Models/Base/index.ts";

import { RoleMstr, ModuleMstr, RoleUserMstr, RoleModuleMstr } from "@Infrastructure/Persistence/Models/Auth/index.ts";

export const sequelize = new Sequelize(
  EnvConfig.database.connectionString,
  {
    logging: false,
    dialect: EnvConfig.database.type as any,
    // dialect: EnvConfig.database.dialect as any,
  }
);

// -------------------------
// Async context helper
// -------------------------
export async function getDbAsync<T>(callback: (sequelize: Sequelize) => Promise<T>): Promise<T> {
  try {
    return await callback(sequelize);
  } catch (err) {
    console.error("❌ Database operation failed:", err);
    throw err;
  }
}

// -------------------------
// Drop all tables
// -------------------------
export async function deleteTables() {
  console.log(`❌ Deleting tables in ${sequelize.getDatabaseName()}`);
  const dialect = sequelize.getDialect();

  if (dialect === "postgres") {
    const dbSchema = EnvConfig.database.dbSchema;
    await sequelize.query(`DROP SCHEMA IF EXISTS "${dbSchema}" CASCADE`);
    await sequelize.query(`CREATE SCHEMA "${dbSchema}"`);
  } else {
    // For MySQL/SQLite/others
    await sequelize.drop();
  }
}

// -------------------------
// Create all tables
// -------------------------
export async function createTables() {
  console.log(`➕ Creating tables in ${sequelize.getDatabaseName()}`);
  await sequelize.sync({ force: false });
  console.log("✅ Database schema created.\n");
}

// -------------------------
// Create specific tables
// -------------------------
export async function createSpecificTables(tables: (typeof Model)[]) {
  for (const tableClass of tables) {
    console.log(`✅ Creating table ${tableClass.name}...`);
    await tableClass.sync({ force: false });
  }
  console.log("✅ Specific tables created.\n");
}

interface SetupDatabaseOptions {
  dropFirst?: boolean;
  dropDbOnly?: boolean;
}
// -------------------------
// Full setup
// -------------------------
export async function setupDatabase(options: SetupDatabaseOptions = {}) {
  const { dropFirst = true, dropDbOnly = false } = options;
  try {
    if (dropDbOnly) {
      console.log("🗑️  Dropping all tables (no create)...");
      await deleteTables();
      return true;
    }

    if (dropFirst) {
      console.log("🗑️  Dropping existing tables...");
      await deleteTables();
    }

    console.log("📦 Creating tables...");
    await createTables();

    // Optional selective creation
    // await createSpecificTables([UserMstr, UserProfile, SsoType, SsoKey, ContactType, ContactMstr, ApiClient]);
    // await createSpecificTables([RoleMstr, ModuleMstr, RoleUserMstr, RoleModuleMstr]);

    console.log("✅ Database setup complete.");
    return true;
  } catch (err) {
    console.error("❌ Unhandled error in setupDatabase:", err);
    return false;
  }
}

// -------------------------
// CLI entrypoint
// -------------------------
// scripts/SeedDatabase.ts
if (import.meta.url === `file://${process.argv[1]}`) {
  // run CLI entry point
  const arg = process.argv[2] ?? "";

  if (arg === "drop") {
    // setupDatabase(true, false);
    setupDatabase({ dropFirst: true, dropDbOnly: false });
  } else if (arg === "drop-only") {
    // setupDatabase(false, true);
    setupDatabase({ dropFirst: false, dropDbOnly: true });
  } else {
    // setupDatabase(false, false);
    setupDatabase({ dropFirst: false, dropDbOnly: false });
  }
}

// if (import.meta.main) {
//   const arg = process.argv[2] ?? "";

//   if (arg === "drop") {
//     // setupDatabase(true, false);
//     setupDatabase({ dropFirst: true, dropDbOnly: false });
//   } else if (arg === "drop-only") {
//     // setupDatabase(false, true);
//     setupDatabase({ dropFirst: false, dropDbOnly: true });
//   } else {
//     // setupDatabase(false, false);
//     setupDatabase({ dropFirst: false, dropDbOnly: false });
//   }
// }
