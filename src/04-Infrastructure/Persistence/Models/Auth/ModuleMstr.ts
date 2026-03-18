// src/04-Infrastructure/Persistence/Models/Auth/ModuleMstr.ts
import { DataTypes, Sequelize } from "sequelize";
import AuditEntity from "@Infrastructure/Persistence/Models/Base/AuditEntity.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";
import type { Models } from "@Infrastructure/Persistence/Models/types.ts";
import { ModuleMstrTableName } from "@Infrastructure/Persistence/Models/Constants/DBNames.ts";

export default class ModuleMstr extends AuditEntity {
  declare ModuleId: number;
  declare ModuleName: string;
  declare ParentId: number | null;
  declare MenuLevel: number;
  declare SortOrder: number;
  declare IconClass: string;
  declare ComponentName: string;
  declare FeUrl: string;
  declare ControllerName: string;
  declare IsParent: boolean;
  declare IsCrud: boolean;
  declare EditComponent: string;
  declare AddComponent: string;
  declare TranCode: string | null;
  declare IsAdmin: boolean;
  declare IsActive: boolean;

  static initModel(sequelize: Sequelize): typeof ModuleMstr {
    ModuleMstr.init(
      {
        ModuleId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: DatabaseNamingConvention.getName("ModuleId"),
        },
        ModuleName: {
          type: DataTypes.STRING(150),
          allowNull: false,
          field: DatabaseNamingConvention.getName("ModuleName"),
        },
        ParentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: DatabaseNamingConvention.getName("ParentId"),
        },
        MenuLevel: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: DatabaseNamingConvention.getName("MenuLevel"),
        },
        SortOrder: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          field: DatabaseNamingConvention.getName("SortOrder"),
        },
        IconClass: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: "",
          field: DatabaseNamingConvention.getName("IconClass"),
        },
        ComponentName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: "",
          field: DatabaseNamingConvention.getName("ComponentName"),
        },
        FeUrl: {
          type: DataTypes.STRING(255),
          allowNull: false,
          defaultValue: "",
          field: DatabaseNamingConvention.getName("FeUrl"),
        },
        ControllerName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: "",
          field: DatabaseNamingConvention.getName("ControllerName"),
        },
        IsParent: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: DatabaseNamingConvention.getName("IsParent"),
        },
        IsCrud: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: DatabaseNamingConvention.getName("IsCrud"),
        },
        EditComponent: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: "",
          field: DatabaseNamingConvention.getName("EditComponent"),
        },
        AddComponent: {
          type: DataTypes.STRING(100),
          allowNull: false,
          defaultValue: "",
          field: DatabaseNamingConvention.getName("AddComponent"),
        },
        TranCode: {
          type: DataTypes.STRING(50),
          allowNull: true,
          field: DatabaseNamingConvention.getName("TranCode"),
        },
        IsAdmin: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: DatabaseNamingConvention.getName("IsAdmin"),
        },
        IsActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: DatabaseNamingConvention.getName("IsActive"),
        },
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName: ModuleMstrTableName,
        modelName: "ModuleMstr",
        timestamps: false,
      }
    );

    return ModuleMstr;
  }

  static associate(models: Models) {
    // Relationship to RoleModuleMstr
    ModuleMstr.hasMany(models.RoleModuleMstr, {
      foreignKey: "ModuleId",
      as: "RoleModules",
    });

    // Self-referencing Parent-Children relationship
    ModuleMstr.belongsTo(ModuleMstr, {
      foreignKey: "ParentId",
      as: "Parent",
    });

    ModuleMstr.hasMany(ModuleMstr, {
      foreignKey: "ParentId",
      as: "Children",
    });
  }
}
