import { DataTypes, Sequelize, ForeignKey } from "sequelize";
import AuditEntity from "./AuditEntity.ts";
import type SsoType from "./SsoType.ts";
import type UserMstr from "./UserMstr.ts";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts"

export default class SsoKey extends AuditEntity {
  declare TypeId: ForeignKey<SsoType["TypeId"]>;
  declare UserId: ForeignKey<UserMstr["UserId"]>;
  declare SsoId: string | null;

  static initModel(sequelize: Sequelize): typeof SsoKey {
    SsoKey.init(
      {
        TypeId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          field: DatabaseNamingConvention.getName("TypeId"),
        },
        UserId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          field: DatabaseNamingConvention.getName("UserId"),
        },
        SsoId: {
          type: DataTypes.STRING(100),
          allowNull: true,
          field: DatabaseNamingConvention.getName("SsoId"),
        },
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName: DatabaseNamingConvention.getName("SsoKeys"),
        modelName: "SsoKey",
        timestamps: false,
      }
    );

    return SsoKey;
  }

  static associate(models: { SsoType: typeof SsoType; UserMstr: typeof UserMstr }) {
    SsoKey.belongsTo(models.SsoType, { foreignKey: "TypeId", as: "Type" });
    SsoKey.belongsTo(models.UserMstr, { foreignKey: "UserId", as: "User" });
  }
}
