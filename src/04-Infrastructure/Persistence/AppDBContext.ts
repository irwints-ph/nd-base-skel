// ==================================================================
// 🧩 src/04-Infrastructure/Persistence/AppDBContext.ts
// ==================================================================
import { Sequelize, Model, Options } from "sequelize";
import path from "path";
import { EnvConfig } from "../Core/ConfigLoader.ts";
import { logger } from "../Core/Logger.ts";
import { InitModels } from "../Core/InitModels.ts";
import { registerAuditHooks } from "../Audit/registerAuditHooks.ts";
import { DatabaseNamingConvention } from "../Core/DatabaseNaming.ts";

/**
 * Database type from environment config
 */
export const dbType = (EnvConfig.database.type || process.env.DB_TYPE ).toLowerCase();
export const DatabaseConfig = EnvConfig.database;

/**
 * Sequelize initialization options
 */
const baseOptions: Options = {
  logging: (process.env.DB_SHOW_SQL || EnvConfig.database.showSql) === "true" ? console.log : false,
  define: {
    underscored: dbType === "postgres" || dbType === "sqlite",
    freezeTableName: false,
    timestamps: true,
    createdAt: "created_on",
    updatedAt: "updated_on",
    paranoid: true,
    deletedAt: "deleted_on",
  },
};

/**
 * Pool config: different for scripts vs API server
 */
const isScript =
  process.argv.some(arg =>
    arg.toLowerCase().includes("seed") ||
    arg.toLowerCase().includes("migration")
  );

const pool: any =
  dbType === "sqlite" && DatabaseConfig.isInMemory
    ? { max: 1, min: 1, idle: 0 } // single connection for in-memory
    : ["postgres", "mysql", "mariadb", "mssql"].includes(dbType)
    ? isScript
      ? {
          max: Number(process.env.DB_POOL_MAX_SCRIPT) || 3,
          min: Number(process.env.DB_POOL_MIN_SCRIPT) || 0,
          idle: Number(process.env.DB_POOL_IDLE_SCRIPT) || 500,
          acquire: Number(process.env.DB_POOL_ACQUIRE_SCRIPT) || 30000,
          evict: Number(process.env.DB_POOL_EVICT) || 500,
        }
      : {
          max: Number(process.env.DB_POOL_MAX) || 10,
          min: Number(process.env.DB_POOL_MIN) || 2,
          idle: Number(process.env.DB_POOL_IDLE) || 10000,
          acquire: Number(process.env.DB_POOL_ACQUIRE) || 30000,
          evict: Number(process.env.DB_POOL_EVICT) || 5000,
        }
    : undefined;
/**
 * Sequelize instance
 */
export const sequelize: Sequelize =
  // dbType === "sqlite"
  //   ? new Sequelize({
  //       dialect: "sqlite",
  //       storage: path.resolve(process.cwd(), process.env.DB_NAME || EnvConfig.database.name),
  //       logging: (process.env.DB_SHOW_SQL || EnvConfig.database.showSql) === "true" ? console.log : false,
  //     })
  dbType === "sqlite"
    ? new Sequelize({
        dialect: "sqlite",
        storage: DatabaseConfig.isInMemory
          ? ":memory:" // 🔥 THIS is the key change
          : path.resolve(
              process.cwd(),
              process.env.DB_NAME || EnvConfig.database.name
            ),
        logging:
          (process.env.DB_SHOW_SQL || EnvConfig.database.showSql) === "true"
            ? console.log
            : false,
        pool: pool, // 🔑 pass the pool here!
      })      
    : new Sequelize(
        process.env.DB_NAME || EnvConfig.database.name,
        process.env.DB_USER || EnvConfig.database.user,
        process.env.DB_PASS || EnvConfig.database.password,
        {
          host: process.env.DB_HOST || EnvConfig.database.host,
          port: Number(process.env.DB_PORT || EnvConfig.database.port),
          dialect: dbType as any,
          ...(pool ? { pool } : {}),
          dialectOptions:
            dbType === "postgres"
              ? { statement_timeout: 30000 }
              : dbType === "mssql"
              ? { options: { enableArithAbort: true, trustServerCertificate: true } }
              : undefined,
          logging: (process.env.DB_SHOW_SQL || EnvConfig.database.showSql) === "true" ? console.log : false,
        }
      );

/**
 * Base model class
 */
export class BaseModel extends Model {}

/**
 * Initialize database connection, models, and audit hooks
 */
export async function setupDatabase(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    logger.info("✅ Database connected");
    if (dbType === "sqlite" && !DatabaseConfig.isInMemory) {
      await sequelize.query("PRAGMA journal_mode=WAL;");
      logger.info("✅ SQLite WAL mode enabled");
    }
    // DatabaseConfig.debugSummary();
    // // Enable WAL for SQLite
    // if (dbType === "sqlite") {
    //   await sequelize.query("PRAGMA journal_mode=WAL;");
    //   logger.info("✅ SQLite WAL mode enabled");
    // }

    // Initialize models
    InitModels(sequelize);

    // Register global audit hooks if enabled
    if ((process.env.AS_AUDIT_ENABLED || EnvConfig.admin.auditEnabled) === "true") {
      registerAuditHooks(sequelize);
    }
    logger.info(`🛢️  Type: ${EnvConfig.database.type} | Name: ${EnvConfig.database.name} | Show SQL: ${EnvConfig.database.showSql}| InMemory: ${EnvConfig.database.isInMemory}`);

    // Verify essential tables exist
    const requiredTables = [
      DatabaseNamingConvention.getName("UserMstr"),
      DatabaseNamingConvention.getName("UserProfile"),
      DatabaseNamingConvention.getName("ContactMstr"),
      DatabaseNamingConvention.getName("SsoKeys"),
    ];

    const qi = sequelize.getQueryInterface();
    const tables = await qi.showAllTables();
    const existing = tables.map(t => t.toString().toLowerCase());
    const missing = requiredTables.filter(t => !existing.includes(t.toLowerCase()));

    missing.forEach(t => logger.error(`❌ Missing table: ${t}`));

    if (missing.length) throw new Error(`Missing required tables: ${missing.join(", ")}`);

    logger.info("✅ Database schema verified");
    return true;
  } catch (err) {
    logger.error("❌ Database setup failed:", err);
    return false;
  }
}

/**
 * Gracefully shutdown the database
 */
export async function shutdownDatabase(): Promise<void> {
  try {
    // Revert SQLite WAL mode
    if (dbType === "sqlite") {
      await sequelize.query("PRAGMA journal_mode=DELETE;");
      logger.info("🔹 SQLite reverted to DELETE journal mode");
    }

    // Force destroy pooled connections for server DBs
    const pool: any = (sequelize as any).connectionManager?.pool;
    
    if (pool && typeof pool.destroyAllNow === "function") {
      await pool.destroyAllNow();
      logger.info("⚡ Force destroyed all DB connections");
    }

    await sequelize.close();
    console.log("✅ DB Context: Database connection closed");
    logger.info("✅ Database connection closed");
  } catch (err) {
    logger.error("❌ Error during DB shutdown:", err);
  }
}
