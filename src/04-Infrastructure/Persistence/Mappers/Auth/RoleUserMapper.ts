// src/infrastructure/persistence/mappers/auth/RoleMapper.ts
import RoleUserMstr from '@Infrastructure/Persistence/Models/Auth/RoleUserMstr.ts';
import { RoleUser } from "@Domain/Entities/Auth/RoleUser.ts";

import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";
import { AppTime } from "@Infrastructure/Core/AppTime.ts";

export class RoleUserMapper {
  static toDomain(model: RoleUserMstr): RoleUser {
    return new RoleUser({
      roleId: model.RoleId,
      userId: model.UserId,
      isActive: model.IsActive,
      createdBy: model.CreatedBy ?? - 1,
    });
  }

  static toOrm(entity: RoleUser): RoleUserMstr {
    return RoleUserMstr.build({
      RoleId: entity.RoleId,
      UserId: entity.UserId,
      IsActive: entity.IsActive,
      CreatedBy: entity.CreatedBy,
    });
  }
  static updateOrmFromDomain(
    ormRole: RoleUserMstr,
    domainRole: RoleUser
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
    // domainRole.UpdatedOn = AppTime.utcNow();

    if (domainRole.IsActive) {
      ormRole.IsActive = domainRole.IsActive;
    }
    ormRole.UpdatedBy = domainRole.UpdatedBy ?? null;
    ormRole.UpdatedOn = domainRole.UpdatedOn ?? null;
    return oldValues;
  }

  static toFlatBase(model: RoleUserMstr) {
    return {
      roleId: model.RoleId,
      userId: model.UserId,
      isActive: model.IsActive,
    };
  }
}
