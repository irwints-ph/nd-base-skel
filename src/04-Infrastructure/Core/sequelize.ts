// ===========================================
// 🧩 src/04-Infrastructure/Core/sequelize.ts
// ===========================================

/**
 * Minimal wrapper for AppDBContext.ts
 * All Sequelize initialization, pool, audit hooks, and shutdown
 * are now handled in AppDBContext.ts
 */

import { sequelize, setupDatabase, shutdownDatabase } from '@Infrastructure/Persistence/AppDBContext.ts';
import type { DatabaseSettings } from '@Infrastructure/Core/DatabaseSettings.ts';
import { EnvConfig } from '@Infrastructure/Core/Config.ts';

/**
 * Expose the existing Sequelize singleton
 */
export { sequelize };

/**
 * Initialize the database connection
 * This includes:
 *  - authenticating
 *  - enabling WAL for SQLite
 *  - initializing models
 *  - registering audit hooks if enabled
 *  - verifying required tables
 */
export async function setupDatabaseWrapper(): Promise<boolean> {
  return await setupDatabase();
}

/**
 * Gracefully shutdown the database
 * This handles:
 *  - SQLite WAL revert
 *  - destroying pooled connections
 *  - closing the Sequelize instance
 */
export async function shutdownDatabaseWrapper(): Promise<void> {
  await shutdownDatabase();
}

/**
 * Ensure the database exists (for Postgres)
 * Optional: used by scripts before setupDatabase
 */
export async function createDatabaseIfNotExists(dbSettings: DatabaseSettings = EnvConfig.database) {
  if (dbSettings.type !== 'postgres') return;

  const { Client } = await import('pg');
  const client = new Client({
    host: dbSettings.host,
    port: dbSettings.port,
    user: dbSettings.user,
    password: dbSettings.password,
    database: 'postgres', // default DB for creation
  });

  await client.connect();
  const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='${dbSettings.name}'`);
  if (res.rowCount === 0) {
    console.log(`Creating database ${dbSettings.name}...`);
    await client.query(`CREATE DATABASE ${dbSettings.name}`);
    console.log('✅ Database created');
  }

  await client.end();
}

// // src/04-Infrastructure/Core/sequelize.ts
// import path from 'path'
// import { Sequelize } from 'sequelize'
// // import Database from 'better-sqlite3'
// import { EnvConfig } from '@Infrastructure/Core/Config.ts'
// import type { DatabaseSettings } from '@Infrastructure/Core/DatabaseSettings.ts'
// import { logger } from '@Infrastructure/Core/Logger.ts'
// import { registerAuditHooks } from "@Infrastructure/Audit/registerAuditHooks.ts";
// import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";

// /**
//  * Create a Sequelize instance based on current settings
//  */
// export function getSequelize(): Sequelize {
//   console.log("🔥 Using Core/sequelize.ts");

//   const db = EnvConfig.database;
//   const type = db.type.toLowerCase();

//   const isScript =
//     process.argv.some(arg =>
//       arg.toLowerCase().includes("seed") ||
//       arg.toLowerCase().includes("migration")
//     );

//   // -----------------------------
//   // Pool config (only for server DBs)
//   // -----------------------------
//   let pool: any = undefined;

//   if (["postgres", "mysql", "mariadb", "mssql"].includes(type)) {
//     pool = isScript
//       ? {
//           max: 3,        // 🔥 fast shutdown for scripts
//           min: 0,
//           idle: 500,
//           acquire: 30000,
//           evict: 500,
//         }
//       : {
//           max: 10,       // 🚀 better throughput for API
//           min: 2,
//           idle: 10000,
//           acquire: 30000,
//           evict: 5000,
//         };
//   }

//   // -----------------------------
//   // SQLite
//   // -----------------------------
//   if (type === "sqlite") {
//     return new Sequelize({
//       dialect: "sqlite",
//       storage: path.resolve(process.cwd(), db.name),
//       logging: db.showSql ?? false,
//     });
//   }

//   // -----------------------------
//   // Validate config
//   // -----------------------------
//   if (!db.user || !db.password || !db.host || !db.name) {
//     throw new Error(`Incomplete DB settings for ${db.type}. Check environment variables.`);
//   }

//   // -----------------------------
//   // Common config
//   // -----------------------------
//   const baseConfig: any = {
//     dialect: type,
//     host: db.host,
//     port: db.port,
//     logging: db.showSql ?? false,
//     ...(pool ? { pool } : {}), // ✅ apply only if exists
//   };

//   // -----------------------------
//   // Postgres-specific tuning
//   // -----------------------------
//   if (type === "postgres") {
//     baseConfig.dialectOptions = {
//       statement_timeout: 30000, // ⏱ prevent hanging queries
//     };
//   }

//   // -----------------------------
//   // MSSQL-specific tuning
//   // -----------------------------
//   if (type === "mssql") {
//     baseConfig.dialectOptions = {
//       options: {
//         enableArithAbort: true,
//         trustServerCertificate: true,
//       },
//     };
//   }

//   return new Sequelize(db.name, db.user, db.password, baseConfig);
// }
// // export function getSequelize(): Sequelize {
// //   const db = EnvConfig.database
// //   // console.log('Initializing Sequelize with DB settings:', db)

// //   if (db.type === 'sqlite') {
// //     return new Sequelize({
// //       dialect: 'sqlite',
// //       // dialectModule: Database,
// //       storage: path.resolve(process.cwd(), db.name),
// //       logging: db.showSql ?? false,
// //     })
// //   }

// //   // Other DBs
// //   if (!db.user || !db.password || !db.host || !db.name) {
// //     throw new Error(`Incomplete DB settings for ${db.type}. Check environment variables.`)
// //   }

// //   return new Sequelize(db.name, db.user, db.password, {
// //     dialect: db.type as any,
// //     host: db.host,
// //     port: db.port,
// //     logging: db.showSql ?? false,
// //   })
// // }

// /**
//  * Singleton instance
//  */
// export const sequelize = getSequelize()

// /**
//  * Ensure Postgres (or other non-SQLite) DB exists before connecting
//  */
// export async function createDatabaseIfNotExists(dbSettings: DatabaseSettings) {
//   if (dbSettings.type === 'sqlite') return

//   let Client: any
//   let defaultDatabase = ''

//   switch (dbSettings.type) {
//     case 'postgres':
//       Client = (await import('pg')).Client
//       defaultDatabase = 'postgres'
//       break
//     // Add MySQL, MSSQL, Oracle if needed
//     default:
//       throw new Error('Unsupported DB type for creation')
//   }

//   if (dbSettings.type === 'postgres') {
//     const client = new Client({
//       host: dbSettings.host,
//       port: dbSettings.port,
//       user: dbSettings.user,
//       password: dbSettings.password,
//       database: defaultDatabase,
//     })
//     await client.connect()

//     const res = await client.query(
//       `SELECT 1 FROM pg_database WHERE datname='${dbSettings.name}'`
//     )

//     if (res.rowCount === 0) {
//       console.log(`Creating database ${dbSettings.name}...`)
//       await client.query(`CREATE DATABASE ${dbSettings.name}`)
//       console.log('✅ Database created')
//     }

//     await client.end()
//   }
// }

// async function assertTablesExist(requiredTables: string[]) {
//   const qi = sequelize.getQueryInterface()
//   const tables = await qi.showAllTables()
//   logger.info('Checking required tables in DB...');
//   const existing = tables.map(t => t.toString().toLowerCase())
//     const missing = requiredTables.filter(t => {
//       const exists = existing.includes(t.toLowerCase())
//       logger.info(`Table ${t}: ${exists ? '✅ exists' : '❌ missing'}`)
//       return !exists
//   })

//   if (missing.length) {
//     throw new Error(
//       `❌ Missing required DB tables: ${missing.join(", ")}`
//     )
//   }
// }

// /**
//  * Initialize DB connection
//  */
// import { InitModels } from './InitModels.ts'
// export async function setupDatabase(): Promise<boolean> {
//   try {
//     await sequelize.authenticate();
//     logger.info('✅ Database connected');

//     // 🔹 Enable WAL mode for SQLite
//     if (EnvConfig.database.type === 'sqlite') {
//       await sequelize.query("PRAGMA journal_mode=WAL;");
//       logger.info("✅ SQLite WAL mode enabled");
//     }

//     InitModels(sequelize);
//     if(EnvConfig.admin.auditEnabled){
//       // Register global audit hooks ONCE (must happen after models are initialized) - needed for api call to ensure audit
//       registerAuditHooks(sequelize);
//     }

//     await assertTablesExist([
//       DatabaseNamingConvention.getName("UserMstr"),
//       DatabaseNamingConvention.getName("UserProfile"),
//       DatabaseNamingConvention.getName("ContactMstr"),
//       DatabaseNamingConvention.getName("SsoKeys")
//     ]);

//     logger.info('✅ Database schema verified');
//     return true;
//   } catch (err) {
//     logger.error('❌ Database setup failed:', err);
//     return false;
//   }
// }
// /**
//  * Gracefully close the database connection
//  * and revert SQLite back to DELETE mode so WAL/SHM are cleaned up.
//  */
// export async function shutdownDatabase(): Promise<void> {
//   try {
//     if (EnvConfig.database.type === "sqlite") {
//       await sequelize.query("PRAGMA journal_mode=DELETE;");
//       logger.info("🔹 SQLite reverted to DELETE journal mode");
//     }

//     // 🔥 Force destroy all pooled connections (Postgres fix)
//     const pool: any = (sequelize as any).connectionManager?.pool;

//     if (pool && typeof pool.destroyAllNow === "function") {
//       await pool.destroyAllNow();
//       logger.info("⚡ Force destroyed all DB connections");
//     }

//     await sequelize.close();
//     logger.info("✅ Database connection closed");
//   } catch (err) {
//     logger.error("❌ Error during DB shutdown:", err);
//   }
// }
// // export async function shutdownDatabase(): Promise<void> {
// //   try {
// //     if (EnvConfig.database.type === "sqlite") {
// //       await sequelize.query("PRAGMA journal_mode=DELETE;");
// //       logger.info("🔹 SQLite reverted to DELETE journal mode");
// //     }
// //     await sequelize.close();
// //     logger.info("✅ Database connection closed");
// //   } catch (err) {
// //     logger.error("❌ Error during DB shutdown:", err);
// //   }
// // }