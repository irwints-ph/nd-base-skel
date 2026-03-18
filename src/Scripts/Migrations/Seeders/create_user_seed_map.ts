// src/Scripts/Migrations/seeders/create_user_seed_map.ts

export interface CreateUserSeedDto {
  username: string;
  password: string;
  email: string;
  active: boolean;
  firstname: string;
  lastname: string;
}

/**
 * Maps a CSV row to a CreateUserSeedDto
 * Equivalent to Python map_create_user_seed
 */
export function mapCreateUserSeed(
  row: Record<string, string | undefined>
): CreateUserSeedDto {
  const parseBool = (val?: string): boolean => {
    if (!val || val.trim() === "") return false;

    const normalized = val.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  };

  return {
    username: row["Username"] ?? "",
    password: row["Password"] ?? "",
    email: row["Email"] ?? "",
    active: parseBool(row["VerifyEmail"]),
    firstname: row["Firstname"] ?? "",
    lastname: row["Lastname"] ?? "",
  };
}
