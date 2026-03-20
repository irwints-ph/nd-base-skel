// src/scripts/migrations/seed_runner.ts

import { seedSsoTypes } from "./Seeders/01-SeedSsoTypes.ts"
import SeedContactTypes from "./Seeders/02-SeedContactTypes.ts"
import { SeedUsers } from "./Seeders/03-SeedUsers.ts"
import SeedModules from "./Seeders/04-SeedModules.ts"
import SeedRoles from "./Seeders/05-SeedRoles.ts"

import seed_role_modules from "./Seeders/06-seed_role_modules.ts"
import seed_role_users from "./Seeders/07-seed_role_users.ts"

export async function runSeeders(
  dataDir: string,
  cs?: string
): Promise<boolean> {
  let noErrors = true

  noErrors = await seedSsoTypes(dataDir, noErrors)
  if (noErrors) noErrors = await SeedContactTypes(dataDir, noErrors)
  if (noErrors) noErrors = await SeedUsers(dataDir, noErrors)
  if (noErrors) noErrors = await SeedModules(dataDir, noErrors, cs)

  if (noErrors) noErrors = await SeedRoles(dataDir, noErrors)
  if (noErrors) noErrors = await seed_role_modules(dataDir, noErrors, cs)
  if (noErrors) noErrors = await seed_role_users(dataDir, noErrors)

  return noErrors
}