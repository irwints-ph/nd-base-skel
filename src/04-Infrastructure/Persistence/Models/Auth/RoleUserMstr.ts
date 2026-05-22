// ===================================================================
// 🟢 src/04-Infrastructure/Persistence/Models/Auth/RoleUserMstr.ts
// ===================================================================

import { DataTypes, Sequelize, ForeignKey } from "sequelize";
import AuditEntity from "#Infrastructure/Persistence/Models/Base/AuditEntity.ts";
import type { Models } from "#Infrastructure/Persistence/Models/types.ts";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts";

export default class RoleUserMstr extends AuditEntity {
  declare RoleId: ForeignKey<number>;
  declare UserId: ForeignKey<number>;
  declare IsActive: boolean;

  static initModel(sequelize: Sequelize): typeof RoleUserMstr {
    RoleUserMstr.init(
      {
        RoleId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("RoleId"),
        },
        UserId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("UserId"),
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
        tableName: DatabaseNamingConvention.getName("RoleUser"),
        modelName: "RoleUserMstr",
        timestamps: false,
        indexes: [
          {
            unique: true,
            fields: [DatabaseNamingConvention.getName('RoleId'), DatabaseNamingConvention.getName('UserId')], // ✅ correct
          },
        ]
      }
    );

    return RoleUserMstr;
  }

  static associate(models: Models) {
    // Role relationship
    RoleUserMstr.belongsTo(models.RoleMstr, {
      foreignKey: "RoleId",
      as: "Role",
    });

    // User relationship
    RoleUserMstr.belongsTo(models.UserMstr, {
      foreignKey: "UserId",
      as: "User",
    });

    // CreatedBy relationship (audit)
    RoleUserMstr.belongsTo(models.UserMstr, {
      foreignKey: "CreatedBy",
      as: "CreatedByUser",
    });
  }
}
