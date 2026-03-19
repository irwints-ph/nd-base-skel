// src/domain/interfaces/auth/IRoleRepository.ts
import { Role } from "../../Entities/Auth/Role.ts";
import RoleMstr from "@Infrastructure/Persistence/Models/Auth/RoleMstr.ts";

export interface IRoleRepository {
  getById(roleId: number): Promise<Role | null>;
  getByIdOrm(roleId: number): Promise<RoleMstr | null>;
  getByName(roleName: string): Promise<Role | null>;
  add(domainRole: Role): Promise<RoleMstr | void>;
  update(domainRole: Role, updatedBy: number): Promise<RoleMstr | void>
  delete(domainRole: Role): Promise<RoleMstr| void>;
  save(domainRole: Role): Promise<RoleMstr | void>
}
