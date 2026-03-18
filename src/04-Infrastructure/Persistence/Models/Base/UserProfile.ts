// src/04-Infrastructure/Persistence/Models/Base/UserProfile.ts
import {
  DataTypes,
  Sequelize,
  ForeignKey,
} from "sequelize";
import AuditEntity from "./AuditEntity.ts";
import type UserMstr from "./UserMstr.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts"

export default class UserProfile extends AuditEntity {
  declare UserId: ForeignKey<UserMstr["UserId"]>;
  declare Firstname: string;  
  declare Lastname: string;

  static initModel(sequelize: Sequelize): typeof UserProfile {
    UserProfile.init(
      {
        UserId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("UserId"),
        },

        Firstname: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: DatabaseNamingConvention.getName("Firstname"),
        },

        Lastname: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: DatabaseNamingConvention.getName("Lastname"),
        },

        // Audit fields from base
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName: DatabaseNamingConvention.getName("UserProfile"),
        modelName: "UserProfile",
        timestamps: false,
        underscored: false,
      }
    );

    return UserProfile;
  }

  static associate(models: {
    UserMstr: typeof import("./UserMstr.ts").default;
  }) {
    UserProfile.belongsTo(models.UserMstr, {
      foreignKey: "UserId",
      as: "User",
    });
  }
}
