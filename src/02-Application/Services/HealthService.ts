import { Sequelize } from "sequelize";
import { logger } from "#Infrastructure/Core/Logger.ts";
import { EnvConfig } from "#Infrastructure/Core/ConfigLoader.ts";

// Track app start time
const startTime = Date.now();

export interface HealthResult {
  IsHealthy: boolean;
  UptimeSeconds: number;
  Database: any;
  Error: any;
}

export class GetHealthUseCase {

  private db: Sequelize;

  constructor(db: Sequelize) {
    this.db = db;
  }

  async execute(): Promise<HealthResult> {

    const health: HealthResult = {
      IsHealthy: true,
      UptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      Database: null,
      Error: null
    };

    let displayName: string | null = null;

    try {
      const dialect = this.db.getDialect();
      const dbConfig: any = this.db.config;
      const dbHostname = EnvConfig.database.host ?? "";
      displayName = dbConfig.database ?? EnvConfig.database.name;

      // ---------------------------
      // Query selection
      // ---------------------------
      let query = "SELECT 1";
      if (dialect === "oracle") query = "SELECT 1 FROM DUAL";

      // ---------------------------
      // Use transaction
      // ---------------------------
      const start = Date.now();

      await this.db.transaction(async (t) => {
        // main health query
        await this.db.query(query, { transaction: t });

        // detect schema
        let schemaQuery: string | null = null;
        if (dialect === "postgres") schemaQuery = "SELECT current_schema()";
        else if (dialect === "mssql") schemaQuery = "SELECT SCHEMA_NAME() as schema";
        else if (dialect === "oracle") schemaQuery = "SELECT SYS_CONTEXT('USERENV','CURRENT_SCHEMA') AS schema FROM dual";

        let schemaName: string | null = null;
        if (schemaQuery) {
          const [rows]: any = await this.db.query(schemaQuery, { transaction: t });
          schemaName = rows?.[0]?.current_schema ?? rows?.[0]?.schema ?? rows?.[0]?.SCHEMA ?? null;
        }

        if (schemaName) {
          displayName = `${displayName} (${schemaName}) ${dbHostname}`;
        }
      });

      const elapsed = Date.now() - start;

      health.Database = {
        status: "connected",
        responseTime: elapsed,
        type: dialect,
        displayName
      };

    } catch (err: any) {

      logger.warn("Database health check failed", err);

      const dialect = this.db.getDialect();
      health.IsHealthy = false;
      health.Database = {
        status: "disconnected",
        responseTime: null,
        type: dialect,
        displayName
      };
      health.Error = {
        type: "database",
        message: "Database connection failed",
        details: err?.message ?? err
      };

    }

    return health;
  }
}
// // ===================================================================
// // 🧩 App/Application/Services/HealthService.ts
// // ===================================================================

// import { Sequelize } from "sequelize";
// import { logger } from "#Infrastructure/Core/Logger.ts";
// import { EnvConfig } from "#Infrastructure/Core/ConfigLoader.ts";

// // Track app start time
// const startTime = Date.now();

// export interface HealthResult {
//   IsHealthy: boolean
//   UptimeSeconds: number
//   Database: any
//   Error: any
// }

// export class GetHealthUseCase {

//   private db: Sequelize;

//   constructor(db: Sequelize) {
//     this.db = db;
//   }

//   async execute(): Promise<HealthResult> {

//     const health: HealthResult = {
//       IsHealthy: true,
//       UptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
//       Database: null,
//       Error: null
//     };

//     let displayName: string | null = null;

//     try {

//       const dialect = this.db.getDialect();

//       const dbConfig: any = this.db.config;

//       displayName = dbConfig.database ?? EnvConfig.database.name;

//       // ---------------------------
//       // Query selection
//       // ---------------------------

//       let query = "SELECT 1";

//       if (dialect === "oracle") {
//         query = "SELECT 1 FROM DUAL";
//       }

//       // ---------------------------
//       // Measure response time
//       // ---------------------------

//       const start = Date.now();

//       await this.db.query(query);

//       const elapsed = Date.now() - start;

//       let schemaName: string | null = null;

//       // ---------------------------
//       // Detect schema
//       // ---------------------------

//       if (dialect === "postgres") {

//         const [rows]: any = await this.db.query(
//           "SELECT current_schema()"
//         );

//         schemaName = rows?.[0]?.current_schema ?? null;
//       }

//       else if (dialect === "mssql") {

//         const [rows]: any = await this.db.query(
//           "SELECT SCHEMA_NAME() as schema"
//         );

//         schemaName = rows?.[0]?.schema ?? null;
//       }

//       else if (dialect === "oracle") {

//         const [rows]: any = await this.db.query(
//           "SELECT SYS_CONTEXT('USERENV','CURRENT_SCHEMA') AS schema FROM dual"
//         );

//         schemaName = rows?.[0]?.schema ?? null;
//       }

//       if (schemaName) {
//         displayName = `${displayName} (${schemaName})`;
//       }

//       health.Database = {
//         status: "connected",
//         responseTime: elapsed,
//         type: dialect,
//         displayName
//       };

//     }
//     catch (err: any) {

//       logger.warn("Database health check failed", err);

//       const dialect = this.db.getDialect();

//       health.IsHealthy = false;

//       health.Database = {
//         status: "disconnected",
//         responseTime: null,
//         type: dialect,
//         displayName
//       };

//       health.Error = {
//         type: "database",
//         message: "Database connection failed",
//         details: err?.message ?? err
//       };

//     }

//     return health;

//   }

// }