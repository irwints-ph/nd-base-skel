// ===================================================================
// 🧩 src/04-Infrastructure/Persistence/Models/Base/ContactMstr.ts
// ===================================================================

import {
  DataTypes,
  Sequelize,
  ForeignKey,
  Model,
} from "sequelize";

import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";

import UserMstr from "./UserMstr.ts";
import ContactType from "./ContactType.ts";
import AuditEntity from "./AuditEntity.ts";

export default class ContactMstr extends AuditEntity {
  // ---------------------------------------------------------
  // 🧱 Primary Key (Surrogate Identity)
  // ---------------------------------------------------------
  declare Id: number;

  // ---------------------------------------------------------
  // 🔗 Foreign Keys
  // ---------------------------------------------------------
  declare UserId: ForeignKey<UserMstr["UserId"]>;
  declare ContactTypeId: ForeignKey<ContactType["ContactTypeId"]>;

  // ---------------------------------------------------------
  // 🧱 Fields
  // ---------------------------------------------------------
  declare ContactValue: string;
  declare Validated: boolean;
  declare ValidationDate: Date | null;
  declare IsPrimary: boolean;

  static initModel(sequelize: Sequelize): typeof ContactMstr {
    ContactMstr.init(
      {
        // -----------------------------------------------------
        // Primary Key (NEW: surrogate key like SQLAlchemy)
        // -----------------------------------------------------
        Id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("Id"),
        },

        // -----------------------------------------------------
        // Foreign Keys
        // -----------------------------------------------------
        UserId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: DatabaseNamingConvention.getName("UserId"),
        },

        ContactTypeId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          field: DatabaseNamingConvention.getName("ContactTypeId"),
        },

        // -----------------------------------------------------
        // Fields
        // -----------------------------------------------------
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

        // -----------------------------------------------------
        // Audit fields
        // -----------------------------------------------------
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName: DatabaseNamingConvention.getName("ContactMstr"),
        modelName: "ContactMstr",
        timestamps: false,

        // -----------------------------------------------------
        // Indexes + Constraints (SQLAlchemy equivalent)
        // -----------------------------------------------------
        indexes: [
          {
            name: "ix_user_contact_lookup",
            fields: [
              DatabaseNamingConvention.getName("UserId"),
              DatabaseNamingConvention.getName("ContactTypeId"),
            ],
          },
        ],
      }
    );

    return ContactMstr;
  }

  static associate(models: {
    UserMstr: typeof UserMstr;
    ContactType: typeof ContactType;
  }) {
    // ---------------------------------------------------------
    // 🔗 User relationship
    // ---------------------------------------------------------
    ContactMstr.belongsTo(models.UserMstr, {
      foreignKey: "UserId",
      as: "User",
    });

    // ---------------------------------------------------------
    // 🔗 Contact Type relationship
    // ---------------------------------------------------------
    ContactMstr.belongsTo(models.ContactType, {
      foreignKey: "ContactTypeId",
      as: "Type",
    });
  }

  // =========================================================
  // 🧠 Domain-like helper methods (from SQLAlchemy version)
  // =========================================================

  markAsPrimary() {
    this.IsPrimary = true;
  }

  markAsValidated(date: Date = new Date()) {
    this.Validated = true;
    this.ValidationDate = date;
  }

  get isValid(): boolean {
    return this.Validated === true;
  }
}