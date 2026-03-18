// ===================================================================
// 🧩 src/scripts/migrations/seeders/seederUtils.ts
// ===================================================================

import { Model, ModelStatic } from "sequelize";

/**
 * Return a list of primary key column names for a given Sequelize model
 */
export function getPrimaryKeyFields<T extends Model>(model: ModelStatic<T>): string[] {
  if (!model || !model.primaryKeyAttributes) return [];
  // Convert readonly string[] to mutable string[]
  return [...model.primaryKeyAttributes];
}