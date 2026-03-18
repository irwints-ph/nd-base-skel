// ===========================================
// 🧩 Infrastructure/Core/AppTime.ts
// ===========================================

import { EnvConfig } from './ConfigLoader.ts'; // Adjust path as needed
const dbType = EnvConfig.database.type.toString();
export class AppTime {
  
  // -----------------------------
  // NOW
  // -----------------------------
  public static utcNow(): Date {
    const now = new Date();
    if (dbType === "postgresql") {
      // PostgreSQL: return UTC date
      return new Date(now.toISOString());
    }
    // MySQL / SQLite: naive
    return now;
  }

  public static appNow(): Date {
    // Alias for utcNow
    return AppTime.utcNow();
  }

  public static appDateNow(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  // -----------------------------
  // SENTINELS
  // -----------------------------
  public static maxDate(): Date {
    if (dbType === "mysql") {
      return new Date(9999, 11, 31, 23, 59, 59); // months 0-indexed
    }
    if (dbType === "postgresql") {
      return new Date(Date.UTC(9999, 11, 31, 23, 59, 59));
    }
    // sqlite
    return new Date(9999, 11, 31, 23, 59, 59);
  }

  public static minDate(): Date {
    if (dbType === "postgresql") {
      return new Date(Date.UTC(1000, 0, 1)); // Jan = 0
    }
    return new Date(1000, 0, 1);
  }
}
