// ===================================================================
// 🟢 src/02-Application/Queries/Auth/ModuleServiceQuery.ts
// ===================================================================
import { Op, fn, col, where } from "sequelize";
import { GenericQueryService } from "@Infrastructure/Persistence/Queries/GenericQueryService.ts";
import { PaginatedResponse } from "@Contracts/Common/BaseSchema.ts";

import ModuleMstr from "@Infrastructure/Persistence/Models/Auth/ModuleMstr.ts";
import { ModuleMapper } from "@Infrastructure/Persistence/Mappers/Auth/ModuleMapper.ts";
import { ModuleRepository } from "@Infrastructure/Persistence/Repositories/Auth/ModuleRepository.ts";
import type { UserFlatBase } from "01-Contracts/Base/Users/UserSchemas.ts"
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";

const moduleRepo = new ModuleRepository();
export class ModuleServiceQuery {
  private generic: GenericQueryService<any, any>;

  constructor() {
    this.generic = new GenericQueryService(
      ModuleMstr,
      ModuleMapper.toFlatBase,
      this.applySearch,
      this.applySorting
    );
  }

  // ------------------------
  // Search logic
  // ------------------------
  private applySearch(options: any, search: string, column?: string): any {
    if (!search) return options;
    // const searchPattern = `%${search}%`;
    const searchPattern = `%${search.toLowerCase()}%`;
    // Detect dialect
    if (column && ModuleMstr.rawAttributes[column]) {
      options.where = {
        ...options.where,
        [Op.and]: where(fn("LOWER", col(column)), { [Op.like]: searchPattern }),
      };
      return options;
    }
    // const keyNam = DatabaseNamingConvention.getName("ModuleMstr");
    const keyNam = "ModuleMstr";
    const modNam = DatabaseNamingConvention.getName("ModuleName");
    const comNam = DatabaseNamingConvention.getName("ComponentName");

    options.subQuery = false;
    options.where = {
      ...options.where,
      [Op.or]: [
        where(fn("LOWER", col(`${keyNam}.${modNam}`)), { [Op.like]: searchPattern }),
        where(fn("LOWER", col(`${keyNam}.${comNam}`)), { [Op.like]: searchPattern }),
      ],
    };

    return options;
  }

  // ------------------------
  // Sorting logic
  // ------------------------
  private applySorting(options: any, sortBy?: string, descending = false): any {
    if (sortBy && ModuleMstr.rawAttributes[sortBy]) {
      options.order = [[sortBy, descending ? "DESC" : "ASC"]];
    } else {
      options.order = [[DatabaseNamingConvention.getName("moduleId"), "DESC"]];
    }
    return options;
  }

  // ------------------------
  // List Users (with pagination + search + sorting)
  // ------------------------
  async listModules(
    page = 1,
    pageSize = 10,
    search?: string,
    column?: string,
    sortBy?: string,
    descending = false,
    access?: string
  ): Promise<PaginatedResponse> {
    const withJoinsAndIncludes = (options: any) => {
      return options;
    };
    return sequelize.transaction(async (tx) => {
      return await this.generic.getAsync(
        page,
        pageSize,
        search,
        column,
        sortBy,
        descending,
        withJoinsAndIncludes,
        undefined,
        access,
        tx,
      );
    });
  }

  // ------------------------
  // Get Single User
  // ------------------------
  async getModule(moduleId: number) {
    return sequelize.transaction(async (tx) => {
      const user = await ModuleMstr.findByPk(moduleId, {
        transaction: tx, // ✅ ensures connection is released
      });
      return user ? ModuleMapper.toFlatBase(user) : null;
    });
  }
  async getRoutes(currentUser: UserFlatBase) {
    return sequelize.transaction(async (tx) => {
      // 🔹 Ensure repo queries run inside the transaction
      const modulesWithPermissions = await moduleRepo.getUserAccessibleModules(
        currentUser?.userId ?? -1,
        tx // ✅ pass transaction down
      );

      const routes: string[] = [];
      for (const [module, auth] of modulesWithPermissions) {
        if (!module.IsActive) continue;

        routes.push(module.FeUrl);

        if (module.IsCrud) {
          if (auth[1] === "Y") routes.push(`${module.FeUrl}/add`);
          if (auth[2] === "Y") routes.push(`${module.FeUrl}/edit/:id`);
          if (auth[0] === "Y") routes.push(`${module.FeUrl}/view/:id`);
        }
      }

      return [...new Set(routes)].sort();
    });
  }

  // async getRoutes(currentUser:UserFlatBase) {
  //   const modulesWithPermissions = await moduleRepo.getUserAccessibleModules(currentUser?.userId ?? -1);

  //   const routes: string[] = [];
  //   for (const [module, auth] of modulesWithPermissions) {
  //     if (!module.IsActive) continue;

  //     routes.push(module.FeUrl);

  //     if (module.IsCrud) {
  //       if (auth[1] === "Y") routes.push(`${module.FeUrl}/add`);
  //       if (auth[2] === "Y") routes.push(`${module.FeUrl}/edit/:id`);
  //       if (auth[0] === "Y") routes.push(`${module.FeUrl}/view/:id`);
  //     }
  //   }
  //   return [...new Set(routes)].sort();
  // }

}
