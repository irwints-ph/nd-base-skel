// src/infrastructure/persistence/models/base/DefaultConfigurationMstr.ts
import { DataTypes, Model, Optional, Sequelize } from "sequelize";
// import sequelize from "../../../db"; // your Sequelize instance
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts"
import { DfltCfgMstrTableName } from "../Constants/DBNames.ts";

// Attributes interface
export interface DefaultConfigurationMstrAttributes {
  Id: number;
  ValueKey: string;
  ValueType: string; // 'S' | 'R'
  DataType: string;  // STRING | INT | FLOAT | BOOLEAN | DATE
  ValueLow?: string | null;
  ValueHigh?: string | null;
  Description?: string | null;
  IsActive: number;
}

// Creation attributes (Id is auto-increment)
export interface DefaultConfigurationMstrCreationAttributes
  extends Optional<DefaultConfigurationMstrAttributes, "Id" | "ValueLow" | "ValueHigh" | "Description"> {}

export default class DefaultConfigurationMstr
  extends Model<DefaultConfigurationMstrAttributes, DefaultConfigurationMstrCreationAttributes>
  implements DefaultConfigurationMstrAttributes
{
  declare Id: number;
  declare ValueKey: string;
  declare ValueType: string;
  declare DataType: string;
  declare ValueLow?: string | null;
  declare ValueHigh?: string | null;
  declare Description?: string | null;
  declare IsActive: number;

  static initModel(sequelize: Sequelize): typeof DefaultConfigurationMstr {
    DefaultConfigurationMstr.init(
      {
        Id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          field: DatabaseNamingConvention.getName("Id"),
        },
        ValueKey: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          field: DatabaseNamingConvention.getName("ValueKey"),
        },
        ValueType: {
          type: DataTypes.STRING(1),
          allowNull: false,
          field: DatabaseNamingConvention.getName("ValueType"),
          validate: {
            isIn: [["S", "R"]],
          },
          
        },
        DataType: {
          type: DataTypes.STRING(20),
          allowNull: false,
          field: DatabaseNamingConvention.getName("DataType"),
          validate: {
            isIn: [["STRING", "INT", "FLOAT", "BOOLEAN", "DATE"]],
          },
        },
        ValueLow: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: DatabaseNamingConvention.getName("ValueLow"),
        },
        ValueHigh: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: DatabaseNamingConvention.getName("ValueHigh"),
        },
        Description: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: DatabaseNamingConvention.getName("Description"),
        },
        IsActive: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          field: DatabaseNamingConvention.getName("IsActive"),
        },
      },
      {
        sequelize,
        tableName: DfltCfgMstrTableName,
        modelName: "DefaultConfigurationMstr",
        timestamps: true, // if AuditEntity had createdAt/updatedAt
      }
    );
    return DefaultConfigurationMstr;
  }
}