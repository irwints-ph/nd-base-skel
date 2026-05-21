// ===========================================
// 🧩 Infrastructure/Core/DatabaseSettings.ts
// ===========================================

import { Dialect, Sequelize } from "sequelize";
import { EnvConfig } from "./Config.ts";

type SupportedDB =
  | "sqlite"
  | "sqlite-memory"
  | "postgres"
  | "mysql"
  | "mssql"
  | "oracle";

export class DatabaseSettings {
  public type: Dialect;
  public rawType: SupportedDB;

  public name: string;
  public host: string;
  public port: number;
  public user: string;
  public password: string;
  public dbSchema?: string;

  public showSql: boolean;
  public isInMemory: boolean;

  constructor() {
    this.rawType = (process.env.DB_TYPE || "sqlite").toLowerCase() as SupportedDB;

    this.isInMemory = this.rawType === "sqlite-memory";

    this.type = this.mapDialect(this.rawType);

    this.name = process.env.DB_NAME || "app.sqlite3";
    this.host = process.env.DB_HOST || "localhost";
    this.port = parseInt(process.env.DB_PORT || this.getDefaultPort(this.rawType), 10);
    this.user = process.env.DB_USER || this.getDefaultUser(this.rawType);
    this.password = process.env.DB_PASS || "";
    this.dbSchema = process.env.DB_SCHEMA;

    this.showSql = process.env.DB_SHOW_SQL === "true";
  }

  // ===========================================
  // 🧠 Dialect Mapping
  // ===========================================
  private mapDialect(type: SupportedDB): Dialect {
    switch (type) {
      case "sqlite":
      case "sqlite-memory":
        return "sqlite";

      case "postgres":
        return "postgres";

      case "mysql":
        return "mysql";

      case "mssql":
        return "mssql";

      case "oracle":
        // Sequelize does NOT officially support oracle
        // but kept for future adapter layer
        return "postgres" as Dialect;

      default:
        return "sqlite";
    }
  }

  // ===========================================
  // 🔌 Defaults per DB type
  // ===========================================
  private getDefaultPort(type: SupportedDB): string {
    switch (type) {
      case "postgres":
        return "5432";
      case "mysql":
        return "3306";
      case "mssql":
        return "1433";
      case "oracle":
        return "1521";
      default:
        return "0";
    }
  }

  private getDefaultUser(type: SupportedDB): string {
    switch (type) {
      case "postgres":
        return "postgres";
      case "mysql":
        return "root";
      case "mssql":
        return "sa";
      default:
        return "";
    }
  }

  // ===========================================
  // ⚙️ Sequelize Options
  // ===========================================
  public get sequelizeOptions() {
    const base: any = {
      dialect: this.type,
      logging: this.showSql ? console.log : false,
    };

    // -----------------------------
    // SQLite
    // -----------------------------
    if (this.type === "sqlite") {
      base.storage = this.isInMemory ? ":memory:" : this.name;
      return base;
    }

    // -----------------------------
    // Relational DBs
    // -----------------------------
    base.host = this.host;
    base.port = this.port;
    base.username = this.user;
    base.password = this.password;
    base.database = this.name;

    // -----------------------------
    // MSSQL specific config
    // -----------------------------
    if (this.type === "mssql") {
      base.dialectOptions = {
        options: {
          encrypt: true,
          trustServerCertificate: true,
        },
      };
    }

    // -----------------------------
    // MySQL safe defaults
    // -----------------------------
    if (this.type === "mysql") {
      base.dialectOptions = {
        connectTimeout: 60000,
      };
    }

    return base;
  }

  // ===========================================
  // 🔌 Sequelize Factory
  // ===========================================
  public createSequelize(): Sequelize {
    return new Sequelize(this.sequelizeOptions);
  }

  // ===========================================
  // 🔗 Connection String (Debug only)
  // ===========================================
  public get connectionString(): string {
    if (this.type === "sqlite") {
      return `sqlite:${this.isInMemory ? ":memory:" : this.name}`;
    }

    const passwordPart = this.password ? `:${this.password}` : "";
    return `${this.type}://${this.user}${passwordPart}@${this.host}:${this.port}/${this.name}`;
  }

  // ===========================================
  // 🧪 Debug
  // ===========================================
  public debugSummary(): void {
    console.log("==================================");
    console.log(`[DB] Type        : ${this.rawType}`);
    console.log(`[DB] Dialect     : ${this.type}`);
    console.log(`[DB] Name        : ${this.name}`);
    console.log(`[DB] Host        : ${this.host}`);
    console.log(`[DB] Port        : ${this.port}`);
    console.log(`[DB] InMemory    : ${this.isInMemory}`);
    console.log(`[DB] Show SQL    : ${this.showSql}`);
    console.log("==================================");
  }
}

// ===========================================
// 🧷 Singleton
// ===========================================
export const DatabaseConfig = new DatabaseSettings();
// DatabaseConfig.debugSummary(); // not here- will show differnt values
// // ===========================================
// // 🧩 Infrastructure/Core/DatabaseSettings.ts
// // ===========================================

// import { Dialect, Sequelize } from "sequelize";
// import { EnvConfig } from "./Config.ts";

// export class DatabaseSettings {
//   public type: Dialect;
//   public name: string;
//   public host: string;
//   public port: number;
//   public user: string;
//   public password: string;
//   public dbSchema?: string;
//   public showSql: boolean;
//   private rawType: string;
//   public isInMemory: boolean = false;

//   constructor() {
//     this.rawType = (process.env.DB_TYPE || "sqlite").toLowerCase();

//     // Detect special modes
//     this.isInMemory = this.rawType === "sqlite-memory";

//     // Map to real Sequelize dialect
//     this.type = this.isInMemory ? "sqlite" : (this.rawType as Dialect);    
//     // this.type = (process.env.DB_TYPE as Dialect) || "sqlite";
//     this.name = process.env.DB_NAME || "app.sqlite3";
//     this.host = process.env.DB_HOST || "localhost";
//     this.port = parseInt(process.env.DB_PORT || "5432", 10);
//     this.user = process.env.DB_USER || "postgres";
//     this.password = process.env.DB_PASS || "";
//     this.dbSchema = process.env.DB_SCHEMA;
//     this.showSql = process.env.DB_SHOW_SQL === "true";
//   }

//   // -----------------------------
//   // Sequelize connection options
//   // -----------------------------
//   public get sequelizeOptions(): {
//     dialect: Dialect;
//     host?: string;
//     port?: number;
//     username?: string;
//     password?: string;
//     database?: string;
//     logging?: boolean;
//     dialectOptions?: object;
//   } {
//     const options: any = {
//       dialect: this.type,
//       logging: this.showSql ? console.log : false,
//     };

//     if (this.type !== "sqlite") {
//       options.host = this.host;
//       options.port = this.port;
//       options.username = this.user;
//       options.password = this.password;
//       options.database = this.name;

//       // MSSQL options
//       if (this.type === "mssql") {
//         options.dialectOptions = {
//           options: {
//             encrypt: true,
//             trustServerCertificate: true,
//           },
//         };
//       }
//     } else {
//       // options.storage = this.name; // sqlite file
//       options.storage = this.isInMemory ? ":memory:" : this.name;
//     }

//     return options;
//   }

//   // -----------------------------
//   // Create Sequelize instance
//   // -----------------------------
//   public createSequelize(): Sequelize {
//     return new Sequelize(this.sequelizeOptions);
//   }
  
//   public get connectionString(): string {
//     if (this.type === "sqlite") {
//       return `sqlite:${this.name}`;
//     }
//     return `${this.type}://${this.user}:${this.password}@${this.host}:${this.port}/${this.name}`;
//   }

//   // -----------------------------
//   // Debug summary
//   // -----------------------------
//   public debugSummary(): void {
//     console.log(`[Database] Type: ${this.type}`);
//     console.log(`[Database] Name: ${this.name}`);
//     if (this.type !== "sqlite") {
//       console.log(`[Database] Host: ${this.host}:${this.port}`);
//       console.log(`[Database] User: ${this.user}`);
//     }
//     console.log(`[Database] Show SQL: ${this.showSql}`);
//   }
// }

// // -----------------------------
// // Singleton
// // -----------------------------
// export const DatabaseConfig = new DatabaseSettings();
// // DatabaseConfig.debugSummary();
