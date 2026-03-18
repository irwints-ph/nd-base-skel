// src/04-Infrastructure/Persistence/Models/Base/ApiClient.ts
import { DataTypes, Sequelize, ForeignKey } from "sequelize";
import AuditEntity from "./AuditEntity.ts";
import type UserMstr from "./UserMstr.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts"

export default class ApiClient extends AuditEntity {
  declare UserId: ForeignKey<UserMstr["UserId"]>;
  declare ClientId: string;
  declare ClientSecretHash: string;
  declare IsActive: boolean;
  static initModel(sequelize: Sequelize): typeof ApiClient {
    ApiClient.init(
      {
        UserId: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          allowNull: false,
          field: DatabaseNamingConvention.getName("UserId"),
        },

        ClientId: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: DatabaseNamingConvention.getName("ClientId"),
        },

        ClientSecretHash: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: DatabaseNamingConvention.getName("ClientSecretHash"),
        },

        IsActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
          field: DatabaseNamingConvention.getName("IsActive"),
        },

        // Audit fields
        ...AuditEntity.auditFields(),
      },
      {
        sequelize,
        tableName: DatabaseNamingConvention.getName("ApiClient"),
        modelName: "ApiClient",
        timestamps: false, // using manual audit fields
      }
    );

    return ApiClient;
  }

  static associate(models: { UserMstr: typeof UserMstr }) {
    ApiClient.belongsTo(models.UserMstr, {
      foreignKey: "UserId",
      as: "User",
    });
  }

  // // -----------------------------
  // // Optional: Instance Methods
  // // -----------------------------
  // deactivate(updatedBy?: number) {
  //   this.IsActive = false;
  //   this.UpdatedBy = updatedBy ?? this.UpdatedBy;
  //   this.UpdatedOn = new Date();
  // }

  // activate(updatedBy?: number) {
  //   this.IsActive = true;
  //   this.UpdatedBy = updatedBy ?? this.UpdatedBy;
  //   this.UpdatedOn = new Date();
  // }
}
