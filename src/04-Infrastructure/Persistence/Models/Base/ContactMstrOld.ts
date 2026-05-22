// src/04-Infrastructure/Persistence/Models/Base/ContactMstr.ts
import {
  DataTypes,
  Sequelize,
  ForeignKey,
} from "sequelize";
import AuditEntity from "./AuditEntity.ts";
import type UserMstr from "./UserMstr.ts";
import type ContactType from "./ContactType.ts";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts"

export default class ContactMstr extends AuditEntity {
  declare ContactTypeId: ForeignKey<ContactType["ContactTypeId"]>;
  declare UserId: ForeignKey<UserMstr["UserId"]>;
  declare ContactValue: string;
  declare Validated: boolean;
  declare ValidationDate: Date | null;
  declare IsPrimary: boolean;

  static initModel(sequelize: Sequelize): typeof ContactMstr {
    ContactMstr.init(
      {
        ContactTypeId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("ContactTypeId"),
        },
        UserId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("UserId"),
        },
        ContactValue: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: DatabaseNamingConvention.getName("ContactValue"),
        },
        Validated: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: DatabaseNamingConvention.getName("Validated"),
        },
        ValidationDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: DatabaseNamingConvention.getName("ValidationDate"),
        },
        IsPrimary: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
          field: DatabaseNamingConvention.getName("IsPrimary"),
        },
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName: DatabaseNamingConvention.getName("ContactMstr"),
        modelName: "ContactMstr",
        timestamps: false,
      }
    );

    return ContactMstr;
  }

  static associate(models: { UserMstr: typeof UserMstr; ContactType: typeof ContactType }) {
    ContactMstr.belongsTo(models.UserMstr, {
      foreignKey: "UserId",
      as: "User",
    });

    ContactMstr.belongsTo(models.ContactType, {
      foreignKey: "ContactTypeId",
      as: "Type",
    });
  }
}
