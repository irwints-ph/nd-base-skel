// src/04-Infrastructure/Persistence/Models/Base/AuditLogs.ts

import { DataTypes, Sequelize, Model } from "sequelize";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";

export type AuditActions = "INSERT" | "UPDATE" | "DELETE";
export interface IAuditLogsAttributes {
  Id?: string; // optional, auto-generated
  TableName: string;
  Action: AuditActions;
  KeyValues: string;
  OldValues?: string;
  NewValues?: string;
  ChangedBy?: string;
  ChangedAt?: Date; // optional, default to now
  CorrelationId?: string;
  ChangedAtts?: string; // optional if you don’t always set it
}

export default class AuditLogs extends Model<IAuditLogsAttributes>
  implements IAuditLogsAttributes
{
  declare Id: string;
  declare TableName: string;
  declare Action: AuditActions;
  declare KeyValues: string;
  declare OldValues?: string;
  declare NewValues?: string;
  declare ChangedBy?: string;
  declare ChangedAt: Date;
  declare CorrelationId?: string;
  declare SubId?: string;
  declare SubType?: string;

  static initModel(sequelize: Sequelize): typeof AuditLogs {
    AuditLogs.init(
      {
        Id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          field: DatabaseNamingConvention.getName("Id"),
        },

        TableName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: DatabaseNamingConvention.getName("TableName"),
        },

        Action: {
          type: DataTypes.STRING(10),
          allowNull: false,
          field: DatabaseNamingConvention.getName("Action"),
        },

        KeyValues: {
          type: DataTypes.STRING(1000),
          allowNull: false,
          defaultValue: "{}",
          field: DatabaseNamingConvention.getName("KeyValues"),
        },

        OldValues: {
          type: DataTypes.STRING(1000),
          allowNull: true,
          field: DatabaseNamingConvention.getName("OldValues"),
        },

        NewValues: {
          type: DataTypes.STRING(1000),
          allowNull: true,
          field: DatabaseNamingConvention.getName("NewValues"),
        },

        ChangedBy: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: DatabaseNamingConvention.getName("ChangedBy"),
        },

        ChangedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: DatabaseNamingConvention.getName("ChangedAt"),
        },

        CorrelationId: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: DatabaseNamingConvention.getName("CorrelationId"),
        },

        // SubId: {
        //   type: DataTypes.STRING(100),
        //   allowNull: true,
        //   field: DatabaseNamingConvention.getName("SubId"),
        // },

        // SubType: {
        //   type: DataTypes.STRING(20),
        //   allowNull: true,
        //   field: DatabaseNamingConvention.getName("SubType"),
        // },
      },
      {
        sequelize,
        tableName: DatabaseNamingConvention.getName("AuditLogs"),
        modelName: "AuditLogs",
        timestamps: false,
        underscored: false,
      }
    );

    return AuditLogs;
  }

  // static associate() {
  //   // No relations
  // }
}