// src/04-Infrastructure/Persistence/Models/Auth/RoleMstr.ts
import { DataTypes, Sequelize } from "sequelize";
import AuditEntity from "#Infrastructure/Persistence/Models/Base/AuditEntity.ts";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts";
import type { Models } from "#Infrastructure/Persistence/Models/types.ts";

export default class RoleMstr extends AuditEntity {
  declare RoleId: number;
  declare RoleName: string;
  declare RoleDescription: string;
  declare ParentId: number | null;
  declare IsActive: boolean;
  declare IsAdmin: boolean;

  static initModel(sequelize: Sequelize): typeof RoleMstr {
    RoleMstr.init(
      {
        RoleId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: DatabaseNamingConvention.getName("RoleId"),
        },
        RoleName: {
          type: DataTypes.STRING(150),
          allowNull: false,
          unique: true,
          field: DatabaseNamingConvention.getName("RoleName"),
        },
        RoleDescription: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: DatabaseNamingConvention.getName("RoleDescription"),
        },
        ParentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: DatabaseNamingConvention.getName("ParentId"),
        },
        IsActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: DatabaseNamingConvention.getName("IsActive"),
        },
        IsAdmin: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: DatabaseNamingConvention.getName("IsAdmin"),
        },
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName: DatabaseNamingConvention.getName("RoleMstr"),
        modelName: "RoleMstr",
        timestamps: false,
      }
    );

    return RoleMstr;
  }

  static associate(models: Models) {
    // Self-referencing parent/children
    RoleMstr.belongsTo(RoleMstr, { foreignKey: "ParentId", as: "Parent" });
    RoleMstr.hasMany(RoleMstr, { foreignKey: "ParentId", as: "Children" });

    // RoleUsers relationship
    RoleMstr.hasMany(models.RoleUserMstr, {
      foreignKey: "RoleId",
      as: "RoleUsers",
      onDelete: "CASCADE",
    });

    // RoleModules relationship
    RoleMstr.hasMany(models.RoleModuleMstr, {
      foreignKey: "RoleId",
      as: "RoleModules",
      onDelete: "CASCADE",
    });
  }
}
