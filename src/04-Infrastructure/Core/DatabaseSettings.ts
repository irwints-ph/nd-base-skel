// ===========================================
// 🧩 Infrastructure/Core/DatabaseSettings.ts
// ===========================================

import { Dialect, Sequelize } from "sequelize";
import { EnvConfig } from "./Config.ts";

export class DatabaseSettings {
  public type: Dialect;
  public name: string;
  public host: string;
  public port: number;
  public user: string;
  public password: string;
  public dbSchema?: string;
  public showSql: boolean;

  constructor() {
    this.type = (process.env.DB_TYPE as Dialect) || "sqlite";
    this.name = process.env.DB_NAME || "app.sqlite3";
    this.host = process.env.DB_HOST || "localhost";
    this.port = parseInt(process.env.DB_PORT || "5432", 10);
    this.user = process.env.DB_USER || "postgres";
    this.password = process.env.DB_PASS || "";
    this.dbSchema = process.env.DB_SCHEMA;
    this.showSql = process.env.DB_SHOW_SQL === "true";
  }

  // -----------------------------
  // Sequelize connection options
  // -----------------------------
  public get sequelizeOptions(): {
    dialect: Dialect;
    host?: string;
    port?: number;
    username?: string;
    password?: string;
    database?: string;
    logging?: boolean;
    dialectOptions?: object;
  } {
    const options: any = {
      dialect: this.type,
      logging: this.showSql ? console.log : false,
    };

    if (this.type !== "sqlite") {
      options.host = this.host;
      options.port = this.port;
      options.username = this.user;
      options.password = this.password;
      options.database = this.name;

      // MSSQL options
      if (this.type === "mssql") {
        options.dialectOptions = {
          options: {
            encrypt: true,
            trustServerCertificate: true,
          },
        };
      }
    } else {
      options.storage = this.name; // sqlite file
    }

    return options;
  }

  // -----------------------------
  // Create Sequelize instance
  // -----------------------------
  public createSequelize(): Sequelize {
    return new Sequelize(this.sequelizeOptions);
  }
  
  public get connectionString(): string {
    if (this.type === "sqlite") {
      return `sqlite:${this.name}`;
    }
    return `${this.type}://${this.user}:${this.password}@${this.host}:${this.port}/${this.name}`;
  }

  // -----------------------------
  // Debug summary
  // -----------------------------
  public debugSummary(): void {
    console.log(`[Database] Type: ${this.type}`);
    console.log(`[Database] Name: ${this.name}`);
    if (this.type !== "sqlite") {
      console.log(`[Database] Host: ${this.host}:${this.port}`);
      console.log(`[Database] User: ${this.user}`);
    }
    console.log(`[Database] Show SQL: ${this.showSql}`);
  }
}

// -----------------------------
// Singleton
// -----------------------------
export const DatabaseConfig = new DatabaseSettings();
// DatabaseConfig.debugSummary();
