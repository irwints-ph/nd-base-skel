// file: 04-Infrastructure/Persistence/Models/Base/AuditEntity.ts

import { Model, DataTypes,ModelAttributes } from "sequelize";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts"

export default class AuditEntity extends Model {
  // -----------------------------
  // Audit fields — MUST be declared at class level
  // -----------------------------
  declare CreatedBy: number | null;
  declare CreatedOn: Date | null;
  declare UpdatedBy: number | null;
  declare UpdatedOn: Date | null;
  // -----------------------------
  // Helper methods
  // -----------------------------
  activate(updatedBy?: number) {
    (this as any).IsActive = true;
    this.UpdatedBy = updatedBy ?? this.UpdatedBy;
    this.UpdatedOn = new Date();
  }

  deactivate(updatedBy?: number) {
    (this as any).IsActive = false;
    this.UpdatedBy = updatedBy ?? this.UpdatedBy;
    this.UpdatedOn = new Date();
  }
  
  static auditFields(): ModelAttributes {
    return {
      CreatedOn: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: DatabaseNamingConvention.getName("CreatedOn"),
      },
      CreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: DatabaseNamingConvention.getName("CreatedBy"),
      },
      UpdatedOn: {
        type: DataTypes.DATE,
        allowNull: true,
        field: DatabaseNamingConvention.getName("UpdatedOn"),
      },
      UpdatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: DatabaseNamingConvention.getName("UpdatedBy"),
      },
    };
  }
}


// import { Model, DataTypes } from 'sequelize'

// // Only import type (compile-time)
// import type { CreationOptional } from 'sequelize'

// export abstract class AuditEntity<
//   TModelAttributes extends {} = {},
//   TCreationAttributes extends {} = {}
// > extends Model<TModelAttributes, TCreationAttributes> {
//   declare CreatedBy: number
//   declare CreatedOn: CreationOptional<Date>
//   declare UpdatedBy: number | null
//   declare UpdatedOn: Date | null

//   setAudit(updatedBy: number) {
//     this.UpdatedBy = updatedBy
//     this.UpdatedOn = new Date()
//   }

//   static auditColumns() {
//     return {
//       CreatedBy: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//       },
//       CreatedOn: {
//         type: DataTypes.DATE,
//         allowNull: false,
//         defaultValue: DataTypes.NOW,
//       },
//       UpdatedBy: {
//         type: DataTypes.INTEGER,
//         allowNull: true,
//       },
//       UpdatedOn: {
//         type: DataTypes.DATE,
//         allowNull: true,
//       },
//     }
//   }
// }
