// src/domain/interfaces/auth/IRoleRepository.ts
import { Role } from "../../Entities/Auth/Role.ts";
import RoleMstr from "#Infrastructure/Persistence/Models/Auth/RoleMstr.ts";
import { Transaction } from "sequelize";

export interface IRoleRepository {
  getById(roleId: number, tx:Transaction): Promise<Role | null>;
  getByIdOrm(roleId: number, tx:Transaction): Promise<RoleMstr | null>;
  getByName(roleName: string, tx:Transaction): Promise<Role | null>;
  add(domainRole: Role, tx:Transaction): Promise<RoleMstr | void>;
  update(domainRole: Role, updatedBy: number, tx:Transaction): Promise<RoleMstr | void>
  delete(domainRole: Role, tx:Transaction): Promise<RoleMstr| void>;
  save(domainRole: Role, tx:Transaction): Promise<RoleMstr | void>
}
