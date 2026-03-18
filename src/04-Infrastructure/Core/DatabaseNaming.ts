// =============================================
// 🧩 Infrastructure/Core/DatabaseNaming.ts
// =============================================
import { EnvConfig } from './ConfigLoader.ts'; // Adjust path as needed

export enum DefaultValueType {
  UTC_NOW = "utcnow",
}

export class DatabaseNamingConvention {
  // -----------------------------
  // Normalize DB type
  // -----------------------------
  private static normalizeDbType(dbType?: string): string {
    if (!dbType) return "";
    const type = dbType.toLowerCase();

    if (type.includes("postgres")) return "postgres";
    if (type.includes("oracle")) return "oracle";
    if (type.includes("sqlite")) return "sqlite";
    if (type.includes("mysql")) return "mysql";
    if (["mssql", "sqlserver", "sql server"].includes(type)) return "mssql";

    return type;
  }

  // -----------------------------
  // Get normalized entity/table name
  // -----------------------------

  public static getName(entityName: string): string {
    const dbType = EnvConfig.database.type.toString();
    const type = this.normalizeDbType(dbType);

    if (type === "postgres") return this.toSnakeCase(entityName);
    if (type === "oracle") return this.toUpperSnakeCase(entityName);

    return entityName;
  }

  // -----------------------------
  // Get SQL default value
  // -----------------------------
  public static getDefaultValueSql(
    valueType: DefaultValueType,
    dbType?: string
  ): string {
    const type = this.normalizeDbType(dbType);

    if (valueType === DefaultValueType.UTC_NOW) {
      const mapping: Record<string, string> = {
        postgres: "NOW()",
        oracle: "SYSDATE",
        mysql: "CURRENT_TIMESTAMP",
        sqlite: "datetime('now')",
        mssql: "GETUTCDATE()",
      };
      return mapping[type] ?? "GETUTCDATE()"; // fallback
    }

    throw new Error(
      `Default value ${valueType} not supported for DB type ${dbType}`
    );
  }

  // -----------------------------
  // Convert PascalCase/CamelCase to snake_case
  // -----------------------------
  public static toSnakeCase(name: string): string {
    const s1 = name.replace(/(.)([A-Z][a-z]+)/g, "$1_$2");
    const s2 = s1.replace(/([a-z0-9])([A-Z])/g, "$1_$2");
    return s2.toLowerCase();
  }

  // -----------------------------
  // Convert PascalCase/CamelCase to UPPER_SNAKE_CASE
  // -----------------------------
  public static toUpperSnakeCase(name: string): string {
    return this.toSnakeCase(name).toUpperCase();
  }
  public static toPascalCase(name: string): string {
    // If no underscore and starts with uppercase,
    // assume already PascalCase
    if (!name.includes("_") && name.charAt(0) === name.charAt(0).toUpperCase()) {
      return name
    }

    return name
      .split("_")
      .filter(Boolean)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  }

  public static getToPascalCase(entityName: string): string {
    const dbType = EnvConfig.database.type.toString();
    const type = this.normalizeDbType(dbType);
    if (type === "postgres") return this.toPascalCase(entityName);
    if (type === "oracle") return this.toPascalCase(entityName);
    return entityName;
  }

}
