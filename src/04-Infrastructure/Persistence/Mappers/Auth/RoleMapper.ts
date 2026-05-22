// src/infrastructure/persistence/mappers/auth/RoleMapper.ts
import RoleMstr from "#Infrastructure/Persistence/Models/Auth/RoleMstr.ts";
import { Role } from "#Domain/Entities/Auth/Role.ts";

import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts";
import { AppTime } from "#Infrastructure/Core/AppTime.ts";

export class RoleMapper {
  static toDomain(model: RoleMstr): Role {
    return new Role({
      roleName: model.RoleName,
      roleDescription: model.RoleDescription,
      parentId: model.ParentId ?? -1,
      createdBy: model.CreatedBy ?? - 1,
      isAdmin: model.IsAdmin,
      isActive: model.IsActive,
      updatedBy: model.UpdatedBy,
      updatedOn: model.UpdatedOn,
      roleId: model.RoleId,
    });
  }

  static toOrm(entity: Role): RoleMstr {
    return RoleMstr.build({
      RoleId: entity.RoleId,
      RoleName: entity.RoleName,
      RoleDescription: entity.RoleDescription,
      ParentId: entity.ParentId,
      IsAdmin: entity.IsAdmin,
      IsActive: entity.IsActive,
      CreatedBy: entity.CreatedBy,
      UpdatedBy: entity.UpdatedBy,
      // UpdatedOn: entity.UpdatedOn,
    });
  }
  static updateOrmFromDomain(
    ormRole: RoleMstr,
    domainRole: Role
  ): Record<string, any> {

    const oldValues: Record<string, any> = {};

    /* --------------------------------
       Capture old scalar values
    -------------------------------- */

    for (const key of Object.keys(ormRole.get())) {
      const dbField =
        DatabaseNamingConvention.getToPascalCase(key);
      oldValues[dbField] = (ormRole as any)[dbField];
    }
    /* --------------------------------
       Apply domain updates
    -------------------------------- */

    domainRole.UpdatedOn = AppTime.utcNow();

    if (domainRole.RoleName) {
      ormRole.RoleName = domainRole.RoleName;
    }
    ormRole.UpdatedBy = domainRole.UpdatedBy ?? null;
    ormRole.UpdatedOn = domainRole.UpdatedOn;
    return oldValues;
  }

  static toFlatBase(model: RoleMstr) {
    return {
      roleId: model.RoleId,
      roleName: model.RoleName,
      roleDescription: model.RoleDescription,
      parentId: model.ParentId,
      isActive: model.IsActive,
      isAdmin: model.IsAdmin,
    };
  }
}
