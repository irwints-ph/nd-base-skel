// ===================================================================
// 🧩 src/scripts/migrations/seeders/createUserSeedMap.ts
// ===================================================================

function parseBool(val: any): boolean {
  if (val === null || val === undefined || String(val).trim() === "") {
    return false;
  }

  const v = String(val).trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

export function mapCreateUserSeed(row: Record<string, any>) {
  return {
    username: row["Username"] ?? "",
    password: row["Password"] ?? "",
    email: row["Email"] ?? "",
    active: parseBool(row["VerifyEmail"]),
    firstname: row["Firstname"] ?? "",
    lastname: row["Lastname"] ?? "",
  };
}