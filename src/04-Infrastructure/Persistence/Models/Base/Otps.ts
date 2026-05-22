// src/04-Infrastructure/Persistence/Models/Base/Otp.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts";

export default class Otp extends Model {
  declare Id: number;
  declare Email: string;
  declare Code: string;
  declare ExpiresAt: Date;

  static initModel(sequelize: Sequelize): typeof Otp {
    Otp.init(
      {
        Id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          field: DatabaseNamingConvention.getName("Id"),
        },
        Email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          field: DatabaseNamingConvention.getName("Email"),
        },
        Code: {
          type: DataTypes.STRING(50),
          allowNull: false,
          field: DatabaseNamingConvention.getName("Code"),
        },
        ExpiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
          field: DatabaseNamingConvention.getName("ExpiresAt"),
        },

      },
      {
        sequelize,
        tableName: DatabaseNamingConvention.getName("Otps"),
        modelName: "Otp",
        timestamps: false,
      }
    );

    return Otp;
  }
}
