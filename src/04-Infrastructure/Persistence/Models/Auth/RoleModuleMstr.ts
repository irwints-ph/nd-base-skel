// src/04-Infrastructure/Persistence/Models/Auth/RoleModuleMstr.ts
import { DataTypes, Sequelize, ForeignKey, Association } from "sequelize";
import AuditEntity from "@Infrastructure/Persistence/Models/Base/AuditEntity.ts";
import type { Models } from "@Infrastructure/Persistence/Models/types.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";
import ModuleMstr from "@Infrastructure/Persistence/Models/Auth/ModuleMstr.ts";
import RoleMstr from "@Infrastructure/Persistence/Models/Auth/RoleMstr.ts";

export default class RoleModuleMstr extends AuditEntity {
  declare RoleId: ForeignKey<number>;
  declare ModuleId: ForeignKey<number>;
  declare Authorization: string;
  declare IsActive: boolean;
  
  // 👇 Explicitly declare association properties
  declare Module?: ModuleMstr;
  declare Role?: RoleMstr;
  static initModel(sequelize: Sequelize): typeof RoleModuleMstr {
    RoleModuleMstr.init(
      {
        RoleId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("RoleId"),
        },
        ModuleId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("ModuleId"),
        },
        Authorization: {
          type: DataTypes.STRING(5),
          allowNull: false,
          defaultValue: "YYYYY",
          field: DatabaseNamingConvention.getName("Authorization"),
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
        tableName: DatabaseNamingConvention.getName("RoleModule"),
        modelName: "RoleModuleMstr",
        timestamps: false,
      }
    );

    return RoleModuleMstr;
  }

  static associate(models: Models) {
    // Role <-> RoleModule
    RoleModuleMstr.belongsTo(models.RoleMstr, {
      foreignKey: "RoleId",
      as: "Role",
    });

    // Module <-> RoleModule
    RoleModuleMstr.belongsTo(models.ModuleMstr, {
      foreignKey: "ModuleId",
      as: "Module",
    });
  }
}
