// src/04-Infrastructure/Persistence/Models/Base/UserMstr.ts

import { DataTypes,Sequelize } from "sequelize";
import AuditEntity from "./AuditEntity.ts";
import type { Models } from "../types.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts"
export interface IUserMstrAttributes {
  UserId: number;
  Username: string;
  Password: string;
  BegDate: Date;
  EndDate: Date;
}

export default class UserMstr extends AuditEntity implements IUserMstrAttributes{
  declare UserId: number;
  declare Username: string;
  declare Password: string;
  declare BegDate: Date;
  declare EndDate: Date;
  // -------------------------
  // Declare associations for TypeScript
  // -------------------------
  declare Profile?: import("./UserProfile.ts").default; // hasOne UserProfile
  declare Contacts?: import("./ContactMstr.ts").default[]; // hasMany Contacts
  declare ApiClients?: import("./ApiClient.ts").default[]; // hasMany ApiClients
  declare Sso?: import("./SsoKey.ts").default; // hasOne Sso
  // declare RoleUsers?: import("./RoleUser").default[]; // optional
  
  static initModel(sequelize: Sequelize): typeof UserMstr {
    UserMstr.init(
      {
        UserId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: DatabaseNamingConvention.getName("UserId"),
        },

        Username: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          field: DatabaseNamingConvention.getName("Username"),
        },

        Password: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: DatabaseNamingConvention.getName("Password"),
        },

        BegDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: DatabaseNamingConvention.getName("BegDate"),
        },

        EndDate: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: new Date("9999-12-31T00:00:00Z"),
          field: DatabaseNamingConvention.getName("EndDate"),
        },

        // Spread audit fields
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName: DatabaseNamingConvention.getName("UserMstr") ,
        modelName: "UserMstr",
        timestamps: false, // you control audit fields manually
        underscored: false,
      }
    );

    return UserMstr;
  }

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
