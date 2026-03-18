// src/04-Infrastructure/Core/sequelize.ts
import path from 'path'
import { Sequelize } from 'sequelize'
// import Database from 'better-sqlite3'
import { EnvConfig } from '@Infrastructure/Core/Config.ts'
import type { DatabaseSettings } from '@Infrastructure/Core/DatabaseSettings.ts'
import { logger } from '@Infrastructure/Core/Logger.ts'
import { registerAuditHooks } from "@Infrastructure/Audit/registerAuditHooks.ts";

/**
 * Create a Sequelize instance based on current settings
 */
export function getSequelize(): Sequelize {
  const db = EnvConfig.database
  // console.log('Initializing Sequelize with DB settings:', db)

  if (db.type === 'sqlite') {
    return new Sequelize({
      dialect: 'sqlite',
      // dialectModule: Database,
      storage: path.resolve(process.cwd(), db.name),
      logging: db.showSql ?? false,
    })
  }

  // Other DBs
  if (!db.user || !db.password || !db.host || !db.name) {
    throw new Error(`Incomplete DB settings for ${db.type}. Check environment variables.`)
  }

  return new Sequelize(db.name, db.user, db.password, {
    dialect: db.type as any,
    host: db.host,
    port: db.port,
    logging: db.showSql ?? false,
  })
}

/**
 * Singleton instance
 */
export const sequelize = getSequelize()

/**
 * Ensure Postgres (or other non-SQLite) DB exists before connecting
 */
export async function createDatabaseIfNotExists(dbSettings: DatabaseSettings) {
  if (dbSettings.type === 'sqlite') return

  let Client: any
  let defaultDatabase = ''

  switch (dbSettings.type) {
    case 'postgres':
      Client = (await import('pg')).Client
      defaultDatabase = 'postgres'
      break
    // Add MySQL, MSSQL, Oracle if needed
    default:
      throw new Error('Unsupported DB type for creation')
  }

  if (dbSettings.type === 'postgres') {
    const client = new Client({
      host: dbSettings.host,
      port: dbSettings.port,
      user: dbSettings.user,
      password: dbSettings.password,
      database: defaultDatabase,
    })
    await client.connect()

    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${dbSettings.name}'`
    )

    if (res.rowCount === 0) {
      console.log(`Creating database ${dbSettings.name}...`)
      await client.query(`CREATE DATABASE ${dbSettings.name}`)
      console.log('✅ Database created')
    }

    await client.end()
  }
}

async function assertTablesExist(requiredTables: string[]) {
  const qi = sequelize.getQueryInterface()
  const tables = await qi.showAllTables()
  logger.info('Checking required tables in DB...');
  const existing = tables.map(t => t.toString().toLowerCase())
    const missing = requiredTables.filter(t => {
      const exists = existing.includes(t.toLowerCase())
      logger.info(`Table ${t}: ${exists ? '✅ exists' : '❌ missing'}`)
      return !exists
  })

  if (missing.length) {
    throw new Error(
      `❌ Missing required DB tables: ${missing.join(", ")}`
    )
  }
}

/**
 * Initialize DB connection
 */
import { InitModels } from './InitModels.ts'
export async function setupDatabase(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connected');

    // 🔹 Enable WAL mode for SQLite
    if (EnvConfig.database.type === 'sqlite') {
      await sequelize.query("PRAGMA journal_mode=WAL;");
      logger.info("✅ SQLite WAL mode enabled");
    }

    InitModels(sequelize);
    // Register global audit hooks ONCE (must happen after models are initialized) - needed for api call to ensure audit
    registerAuditHooks(sequelize);

    await assertTablesExist([
      "UserMstr",
      "UserProfile",
      "ContactMstr",
      "SsoKeys"
    ]);

    logger.info('✅ Database schema verified');
    return true;
  } catch (err) {
    logger.error('❌ Database setup failed:', err);
    return false;
  }
}
/**
 * Gracefully close the database connection
 * and revert SQLite back to DELETE mode so WAL/SHM are cleaned up.
 */
export async function shutdownDatabase(): Promise<void> {
  try {
    if (EnvConfig.database.type === "sqlite") {
      await sequelize.query("PRAGMA journal_mode=DELETE;");
      logger.info("🔹 SQLite reverted to DELETE journal mode");
    }
    await sequelize.close();
    logger.info("✅ Database connection closed");
  } catch (err) {
    logger.error("❌ Error during DB shutdown:", err);
  }
}