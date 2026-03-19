import { IRoleRepository } from "@Domain/Interfaces/Auth/IRoleRepository.ts";
import { RoleRepository } from "@Infrastructure/Persistence/Repositories/Auth/RoleRepository.ts";

let instance: IRoleRepository | null = null

export function GetRoleRepository(): IRoleRepository | null {
  if (!instance) {
    instance = new RoleRepository()
  }
  return instance
}
