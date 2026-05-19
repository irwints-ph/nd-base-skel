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
