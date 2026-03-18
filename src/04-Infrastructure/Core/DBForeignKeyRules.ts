// ===========================================
// 🧩 Infrastructure/Core/DBForeignKeyRules.ts
// ===========================================

import { EnvConfig } from "../Core/ConfigLoader.ts";

// -----------------------------
// Foreign key "onDelete" rules
// -----------------------------
const DB_TYPE = EnvConfig.database.type;
export let FK_RESTRICT: string | null;

switch (DB_TYPE.toLowerCase()) {
  case "sqlite":
  case "mysql":
  case "postgresql":
    FK_RESTRICT = "RESTRICT";
    break;
  case "mssql":
    FK_RESTRICT = "NO ACTION";
    break;
  default:
    FK_RESTRICT = null;
}

