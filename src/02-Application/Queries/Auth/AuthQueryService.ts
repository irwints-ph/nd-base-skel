// ===================================================================
// 🟢 src/02-Application/Queries/Auth/AuthQueryService
// ===================================================================

import RoleUserMstr from "#Infrastructure/Persistence/Models/Auth/RoleUserMstr.ts";
import RoleModuleMstr from "#Infrastructure/Persistence/Models/Auth/RoleModuleMstr.ts";
import ModuleMstr from "#Infrastructure/Persistence/Models/Auth/ModuleMstr.ts";
import { ModuleAuthorization } from "#Contracts/Base/Modules/ModuleSchemas.ts";
import { DefaultGroupRoleService } from "#Application/Queries/Base/DefaultGroupRoleService.ts";

export class AuthQueryService {
  constructor(private sequelize: any) {}

  async getAuthorizedModulesByUser(
    userId: number,
    controllerName?: string
  ): Promise<ModuleAuthorization[]> {
    // 1️⃣ Get active role IDs
    const roleUsers = await RoleUserMstr.findAll({
      where: { UserId: userId, IsActive: true }
    });
    let roleIds = roleUsers.map(r => r.RoleId);

    const service = new DefaultGroupRoleService(this.sequelize);
    roleIds = await service.augmentRoles(roleIds);
    if (!roleIds || roleIds.length === 0) return [];

    // 2️⃣ Load active RoleModules
    const roleModules = await RoleModuleMstr.findAll({
      where: { RoleId: roleIds, IsActive: true },
      include: [{ model: ModuleMstr, as: "Module" }]
    });
    if (!roleModules || roleModules.length === 0) return [];

    // 3️⃣ Filter by controllerName
    const results: ModuleAuthorization[] = [];
    for (const rm of roleModules) {
      const module = (rm as any).Module as ModuleMstr;
      if (!module || !module.IsActive) continue;
      if (controllerName &&
          module.ControllerName?.toLowerCase() !== controllerName.toLowerCase()) {
        continue;
      }

      results.push({
        authorization: rm.Authorization,
        roleId: rm.RoleId,
        moduleId: module.ModuleId,
        moduleName: module.ModuleName,
        parentId: module.ParentId,
        menuLevel: module.MenuLevel,
        componentName: module.ComponentName,
        controllerName: module.ControllerName,
        feUrl: module.FeUrl,
        sortOrder: module.SortOrder,
        isCrud: module.IsCrud,
        editComponent: module.EditComponent,
        tranCode: module.TranCode
      });
    }

    // 4️⃣ Deduplicate & sort
    const unique = Array.from(
      new Map(results.map(m => [JSON.stringify(m), m])).values()
    );

    return unique.sort((a, b) => {
      const parentA = a.parentId ?? 0;
      const parentB = b.parentId ?? 0;
      const sortA = a.sortOrder ?? 0;
      const sortB = b.sortOrder ?? 0;
      if (parentA !== parentB) return parentA - parentB;
      if (sortA !== sortB) return sortA - sortB;
      return (a.moduleName ?? "").localeCompare(b.moduleName ?? "");
    });
  }

  hasAccess(controllerName: string, modules: ModuleAuthorization[]): boolean {
    return modules.some(
      m => m.controllerName?.toLowerCase() === controllerName.toLowerCase()
    );
  }
}
