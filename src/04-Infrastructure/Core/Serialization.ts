// ===================================================================
// 🧩 src/Infrastructure/Core/Serialization.ts
// ===================================================================
import { Model } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export function serializeFullObject(obj: Model): Record<string, any> {
  const data: Record<string, any> = {};

  // Iterate over all fields in the model’s dataValues
  for (const [key, value] of Object.entries(obj.dataValues)) {
    // Optionally apply naming convention (PascalCase, etc.)
    const fieldName = toPascalCase(key);
    data[fieldName] = serializeValue(value);
  }

  return data;
}

export function serializeValue(value: any): any {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  // Sequelize often returns decimals as strings
  if (typeof value === "string" && !isNaN(Number(value)) && value.trim() !== "") {
    return Number(value);
  }

  if (typeof value === "object" && value instanceof uuidv4) {
    return value.toString();
  }

  return value;
}

// Simple PascalCase converter
function toPascalCase(str: string): string {
  return str
    .replace(/(^\w|_\w)/g, s => s.replace("_", "").toUpperCase());
}
