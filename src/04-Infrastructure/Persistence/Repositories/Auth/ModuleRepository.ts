// ===================================================================
// 🧩 src/04-Infrastructure/Persistence/Repositories/ModuleRepository.ts
// ===================================================================
import { IModuleRepository } from "@Domain/Interfaces/Auth/IModuleRepository.ts";
import ModuleMstr from "@Infrastructure/Persistence/Models/Auth/ModuleMstr.ts";
import RoleUserMstr from "@Infrastructure/Persistence/Models/Auth/RoleUserMstr.ts";
import RoleModuleMstr from "@Infrastructure/Persistence/Models/Auth/RoleModuleMstr.ts";
import { DefaultConfigurationRepository } from "@Infrastructure/Persistence/Repositories/Base/DefaultConfigurationRepository.ts";
import { RoleAssignmentPolicy } from "@Domain/Services/RoleAssignmentPolicy.ts";
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";

import { Module } from "@Domain/Entities/Auth/Module.ts";
import { ModuleMapper } from "@Infrastructure/Persistence/Mappers/Auth/ModuleMapper.ts";


export class ModuleRepository implements IModuleRepository {
  // ----------------------------------------------------
  // 🔹 READS (Queries)
  // ----------------------------------------------------

  async getByIdOrm(moduleId: number): Promise<ModuleMstr | null> {
    return ModuleMstr.findByPk(moduleId, {
      include: ["Children", "Parent", "RoleModules"], // associations must be defined in Sequelize model
    });
  }

  async getByName(moduleName: string): Promise<ModuleMstr | null> {
    return ModuleMstr.findOne({ where: { ModuleName: moduleName } });
  }

  async listAll(): Promise<ModuleMstr[]> {
    return ModuleMstr.findAll({ order: [["SortOrder", "ASC"]] });
  }

  // ----------------------------------------------------
  // 🔹 WRITES (Commands)
  // ----------------------------------------------------

  async create(
    name: string,
    feUrl: string,
    isActive: boolean,
    isCrud: boolean,
    createdBy: number,
    parentId?: number
  ): Promise<ModuleMstr> {
    return ModuleMstr.create({
      ModuleName: name,
      FeUrl: feUrl,
      IsActive: isActive,
      IsCrud: isCrud,
      ParentId: parentId,
      CreatedBy: createdBy,
    });
  }

  async delete(module: ModuleMstr): Promise<void> {
    await module.destroy();
  }

  // ---------------------------------------------------------------------------
  // 🔹 Authorization helpers
  // ---------------------------------------------------------------------------
  async getUserAccessibleModules(userId: number): Promise<[ModuleMstr, string][]> {
    if (userId === EnvConfig.admin.superRoot) {
      const modules = await ModuleMstr.findAll({ where: { IsActive: true } });
      return modules.map(m => [m, "YYYYY"]);
    }

    const userRoles = await RoleUserMstr.findAll({
      where: { UserId: userId },
      attributes: ["RoleId"],
    });
    let userRoleIds = userRoles.map(r => r.RoleId);

    try {
      const repo = new DefaultConfigurationRepository();
      const defaultRoles = await repo.getDefaultGroupRoles();
      userRoleIds = RoleAssignmentPolicy.includeDefaultGroupRoles(userRoleIds, defaultRoles);
    } catch (err) {
      console.error("❌ get_default_group_roles failed:", err);
    }

    if (!userRoleIds.length) return [];

    const roleModules = await RoleModuleMstr.findAll({
      where: { RoleId: userRoleIds, IsActive: true },
      include: [{ association: "Module" }],
    });

    const directAccess: Record<number, [ModuleMstr, string]> = {};
    for (const rm of roleModules) {
      const mod = rm.Module as ModuleMstr;
      const modId = rm.ModuleId;
      if (!directAccess[modId]) {
        directAccess[modId] = [mod, rm.Authorization];
      } else {
        const mergedAuth = ModuleRepository.mergeAuthorizations([
          directAccess[modId][1],
          rm.Authorization,
        ]);
        directAccess[modId] = [mod, mergedAuth];
      }
    }

    const allModules = await ModuleMstr.findAll({ where: { IsActive: true } });
    const moduleMap = new Map(allModules.map(m => [m.ModuleId, m]));

    const finalModules: Record<number, [ModuleMstr, string]> = {};

    const addWithParents = (module: ModuleMstr, authorization: string) => {
      if (!finalModules[module.ModuleId]) {
        finalModules[module.ModuleId] = [module, authorization];
      }
      if (module.ParentId) {
        const parentModule = moduleMap.get(module.ParentId);
        if (parentModule && !finalModules[parentModule.ModuleId]) {
          addWithParents(parentModule, "YYYYY");
        }
      }
    };

    for (const [mod, auth] of Object.values(directAccess)) {
      addWithParents(mod, auth);
    }

    return Object.values(finalModules);
  }

  static mergeAuthorizations(authList: string[]): string {
    if (!authList.length) return "-----";
    const length = authList[0].length;
    const result: string[] = [];
    for (let i = 0; i < length; i++) {
      result.push(authList.some(a => a[i] === "Y") ? "Y" : "-");
    }
    return result.join("");
  }
//-------------------- Backward compatibility for seder ---------
  async save(module: Module, transaction?: any): Promise<Module> {

    // Map domain → ORM
    const ormData = ModuleMapper.toOrm(module);

    // Save with optional transaction
    await ormData.save({ transaction });

    // Optionally rehydrate the domain entity with the DB-generated ID
    module.ModuleId = ormData.ModuleId;

    return module;
  }  

}
