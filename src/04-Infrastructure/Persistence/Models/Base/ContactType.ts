// src/04-Infrastructure/Persistence/Models/Base/ContactType.ts
import { DataTypes, Sequelize } from "sequelize";
import AuditEntity from "./AuditEntity.ts";
import type ContactMstr from "./ContactMstr.ts";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts"
import { ContactTypeTableName } from "../Constants/DBNames.ts";

export default class ContactType extends AuditEntity {
  declare ContactTypeId: number;
  declare ContactTypeText: string;

  static initModel(sequelize: Sequelize): typeof ContactType {
    ContactType.init(
      {
        ContactTypeId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("ContactTypeId"),
        },
        ContactTypeText: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: DatabaseNamingConvention.getName("ContactTypeText"),
        },
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName: ContactTypeTableName,
        modelName: "ContactType",
        timestamps: false,
      }
    );

    return ContactType;
  }

  static associate(models: { ContactMstr: typeof ContactMstr }) {
    ContactType.hasMany(models.ContactMstr, {
      foreignKey: "ContactTypeId",
      as: "Contacts",
      onDelete: "CASCADE",
    });
  }
}
