// ===================================================================
// 🧩 src/04-Infrastructure/Persistence/Repositories/ModuleRepository.ts
// ===================================================================
import { IRoleRepository } from "#Domain/Interfaces/Auth/IRoleRepository.ts";
import RoleMstr from "#Infrastructure/Persistence/Models/Auth/RoleMstr.ts";
import { Role } from "#Domain/Entities/Auth/Role.ts";
import { RoleMapper } from "#Infrastructure/Persistence/Mappers/Auth/RoleMapper.ts";

import { Transaction } from "sequelize";

export class RoleRepository implements IRoleRepository {
  // public session?: Transaction;

  // -------------------------------------------------------------------
  // 🔹 GET BY roleId
  // -------------------------------------------------------------------
  async getByIdOrm(roleId: number, tx:Transaction): Promise<RoleMstr | null> {
    return await RoleMstr.findByPk(roleId, {
      transaction: tx, //this.session,
    });
  }
  async getById(userId: number, tx:Transaction): Promise<Role | null> {
    const ormRole = await this.getByIdOrm(userId,tx);
    return ormRole ? RoleMapper.toDomain(ormRole) : null;
  }

  // -------------------------------------------------------------------
  // 🔹 GET BY USERNAME
  // -------------------------------------------------------------------
  async getByName(roleName: string, tx:Transaction): Promise<Role | null> {
    // console.log(UserMstr.associations);
    if(roleName){
      const ormRole = await RoleMstr.findOne({
        where: { RoleName: roleName },
        transaction: tx, //this.session,
      });
      return ormRole ? RoleMapper.toDomain(ormRole) : null;
    }
    return null;
  }

  // -------------------------------------------------------------------
  // 🔹 ADD Role
  // -------------------------------------------------------------------
  async add(domainRole: Role, tx:Transaction): Promise<RoleMstr> {
    const ormRole = RoleMapper.toOrm(domainRole);
    await ormRole.save({ 
      transaction: tx, //this.session 
    });
    return ormRole;
  }
  // -------------------------------------------------------------------
  // 🔹 UPDATE USER
  // -------------------------------------------------------------------
  async update(domainRole: Role, updatedBy: number, tx:Transaction): Promise<RoleMstr | void> {
    const ormRole = await RoleMstr.findByPk(domainRole.RoleId, {
      transaction: tx, //this.session,
    });
    if (!ormRole) return;

    const dbDomainRole = RoleMapper.toDomain(ormRole);
    dbDomainRole.updateDetails({
      roleName: domainRole.RoleName,
      roleDescription: domainRole.RoleDescription,
      parentId: domainRole.ParentId,
      updatedBy:updatedBy,
      isAdmin: domainRole.IsAdmin,
      isActive: domainRole.IsActive,
    });

    await RoleMapper.updateOrmFromDomain(ormRole, dbDomainRole);
    await ormRole.save({ 
      transaction: tx, //this.session 
    });

    return ormRole;
  }
  // -------------------------------------------------------------------
  // 🔹 DELETE Role
  // -------------------------------------------------------------------
  async delete(domainRole: Role, tx:Transaction): Promise<RoleMstr| void> {
    const ormRole = await RoleMstr.findByPk(domainRole.RoleId, {
      transaction: tx, //this.session
    });

    if (!ormRole) return;
    //For Audit ?
    const dbDomainRole = RoleMapper.toDomain(ormRole);
    await RoleMapper.updateOrmFromDomain(ormRole, dbDomainRole);
    await ormRole.destroy({ 
      transaction: tx, //this.session 
    });
    return ormRole;
  }

  // -------------------------------------------------------------------
  // 🔹 SAVE DOMAIN USER TO ORM - For existing users
  // -------------------------------------------------------------------
  async save(domainRole: Role, tx:Transaction): Promise<RoleMstr | void> {
    const ormRole = await RoleMstr.findByPk(domainRole.RoleId, {
      transaction: tx, //this.session,
    });
    if (!ormRole) return;
    const Oldvalue = RoleMapper.updateOrmFromDomain(ormRole, domainRole);
    await ormRole.save({ 
      transaction: tx, //this.session 
    });

    return ormRole;
  }

}
