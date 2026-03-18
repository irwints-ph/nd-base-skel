// src/04-Infrastructure/Persistence/Models/Base/SsoType.ts
import { DataTypes, Sequelize, CreationOptional } from "sequelize";
import AuditEntity from "./AuditEntity.ts";
// import type SsoKey from "./SsoKey.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts"
import { SsoTypeTableName } from "@Infrastructure/Persistence/Models/Constants/DBNames.ts";

export default class SsoType extends AuditEntity {
  declare TypeId: CreationOptional<number>;
  declare TypeText: string;

  static initModel(sequelize: Sequelize): typeof SsoType {
    SsoType.init(
      {
        TypeId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: DatabaseNamingConvention.getName("TypeId"),
        },
        TypeText: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: DatabaseNamingConvention.getName("TypeText"),
        },
        ...AuditEntity.auditFields(), // spread audit fields from base
      },
      {
        sequelize,
        tableName: SsoTypeTableName,
        modelName: "SsoType",
        timestamps: false,
      }
    );

    return SsoType;
  }

  static associate(models: { SsoKey: typeof import("./SsoKey.ts").default }) {
    SsoType.hasMany(models.SsoKey, {
      foreignKey: "TypeId",
      as: "SsoKeys",
      onDelete: "CASCADE",
    });
  }
}
