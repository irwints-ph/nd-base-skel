// ===========================================
// 🧩 Infrastructure/Persistence/AppDBContext.ts
// ===========================================

import { Sequelize, Options, Model, DataTypes } from "sequelize";
import { EnvConfig } from "../Core/ConfigLoader.ts";

// -----------------------------
// Database URL and type
// -----------------------------
const dbType = EnvConfig.database.type.toLowerCase();

let sequelizeOptions: Options = {
  logging: EnvConfig.database.showSql ? console.log : false,
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

let sequelize: Sequelize;

switch (dbType) {
  case "sqlite":
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: EnvConfig.database.name,
      ...sequelizeOptions,
    });
    break;
  case "postgres":
    sequelize = new Sequelize(
      EnvConfig.database.name,
      EnvConfig.database.user,
      EnvConfig.database.password,
      {
        host: EnvConfig.database.host,
        port: EnvConfig.database.port,
        dialect: "postgres",
        ...sequelizeOptions,
      }
    );
    break;
  case "mysql":
    sequelize = new Sequelize(
      EnvConfig.database.name,
      EnvConfig.database.user,
      EnvConfig.database.password,
      {
        host: EnvConfig.database.host,
        port: EnvConfig.database.port,
        dialect: "mysql",
        ...sequelizeOptions,
      }
    );
    break;
  case "mssql":
    sequelize = new Sequelize(
      EnvConfig.database.name,
      EnvConfig.database.user,
      EnvConfig.database.password,
      {
        host: EnvConfig.database.host,
        port: EnvConfig.database.port,
        dialect: "mssql",
        dialectOptions: {
          options: {
            enableArithAbort: true,
            trustServerCertificate: true,
          },
        },
        ...sequelizeOptions,
      }
    );
    break;
  default:
    throw new Error(`Unsupported DB_TYPE: ${dbType}`);
}

// -----------------------------
// Base class for models
// -----------------------------
export class BaseModel extends Model {
  // Optionally, shared fields like id, createdBy, createdOn, etc. can be added here
}

// -----------------------------
// Exports
// -----------------------------
export { sequelize, dbType };
