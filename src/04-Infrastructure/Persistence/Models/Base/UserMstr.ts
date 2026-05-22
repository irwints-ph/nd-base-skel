// ===================================================================
// 🧩 src/04-Infrastructure/Persistence/Models/Base/UserMstr.ts
// ===================================================================

import {
  DataTypes,
  Sequelize,
} from "sequelize";

import AuditEntity from "./AuditEntity.ts";
import type { Models } from "../types.ts";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts";

export interface IUserMstrAttributes {
  UserId: number;
  Username: string;
  Password: string;
  BegDate: Date;
  EndDate: Date;

  // 🔐 Password Management
  MustChangePassword: boolean;
  FailedAttempts: number;
  IsLocked: boolean;
  PasswordLastChanged?: Date | null;
  PasswordHistory?: string[] | [] | null;
}

export default class UserMstr
  extends AuditEntity
  implements IUserMstrAttributes
{
  // -------------------------
  // Core fields
  // -------------------------
  declare UserId: number;
  declare Username: string;
  declare Password: string;
  declare BegDate: Date;
  declare EndDate: Date;

  // -------------------------
  // Password management
  // -------------------------
  declare MustChangePassword: boolean;
  declare FailedAttempts: number;
  declare IsLocked: boolean;

  declare PasswordLastChanged: Date | null;
  declare PasswordHistory: string[] | []| null;

  // -------------------------
  // Associations (TypeScript only)
  // -------------------------
  declare Profile?: import("./UserProfile.ts").default;

  declare Contacts?: import("./ContactMstr.ts").default[];

  declare ApiClients?: import("./ApiClient.ts").default[];

  declare Sso?: import("./SsoKey.ts").default;

  // declare RoleUsers?: import("./RoleUserMstr.ts").default[];

  // -------------------------
  // Init model
  // -------------------------
  static initModel(
    sequelize: Sequelize,
  ): typeof UserMstr {
    UserMstr.init(
      {
        UserId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field:
            DatabaseNamingConvention.getName(
              "UserId",
            ),
        },

        Username: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          field:
            DatabaseNamingConvention.getName(
              "Username",
            ),
        },

        Password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field:
            DatabaseNamingConvention.getName(
              "Password",
            ),
        },

        BegDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field:
            DatabaseNamingConvention.getName(
              "BegDate",
            ),
        },

        EndDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue:
            new Date("9999-12-31T00:00:00Z"),
          field:
            DatabaseNamingConvention.getName(
              "EndDate",
            ),
        },

        MustChangePassword: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field:
            DatabaseNamingConvention.getName(
              "MustChangePassword",
            ),
        },

        FailedAttempts: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field:
            DatabaseNamingConvention.getName(
              "FailedAttempts",
            ),
        },

        IsLocked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field:
            DatabaseNamingConvention.getName(
              "IsLocked",
            ),
        },

        PasswordLastChanged: {
          type: DataTypes.DATE,
          allowNull: true,
          defaultValue: DataTypes.NOW,
          field:
            DatabaseNamingConvention.getName(
              "PasswordLastChanged",
            ),
        },

        PasswordHistory: {
          type: DataTypes.TEXT,
          allowNull: true,
          field:
            DatabaseNamingConvention.getName(
              "PasswordHistory",
            ),
        },

        // audit fields (unchanged)
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName:
          DatabaseNamingConvention.getName(
            "UserMstr",
          ),
        modelName: "UserMstr",
        timestamps: false,
        underscored: false,
      },
    );

    return UserMstr;
  }

  // -------------------------
  // Associations
  // -------------------------
  static associate(models: Models) {
    UserMstr.hasOne(models.UserProfile, {
      foreignKey: "UserId",
      as: "Profile",
      onDelete: "CASCADE",
    });

    UserMstr.hasOne(models.SsoKey, {
      foreignKey: "UserId",
      as: "Sso",
      onDelete: "CASCADE",
    });

    UserMstr.hasMany(models.ContactMstr, {
      foreignKey: "UserId",
      as: "Contacts",
      onDelete: "CASCADE",
    });

    UserMstr.hasMany(models.ApiClient, {
      foreignKey: "UserId",
      as: "ApiClients",
      onDelete: "CASCADE",
    });

    // UserMstr.hasMany(models.RoleUserMstr, {
    //   foreignKey: "UserId",
    //   as: "RoleUsers",
    //   onDelete: "CASCADE",
    // });
  }
}