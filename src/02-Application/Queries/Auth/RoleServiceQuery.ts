// ===================================================================
// 🟢 src/02-Application/Queries/Auth/RoleServiceQuery.ts
// ===================================================================
import { Op, fn, col, where } from "sequelize";
import { GenericQueryService } from "#Infrastructure/Persistence/Queries/GenericQueryService.ts";
import { PaginatedResponse } from "#Contracts/Common/BaseSchema.ts";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts";

import RoleMstr from "#Infrastructure/Persistence/Models/Auth/RoleMstr.ts";
import { RoleMapper } from "#Infrastructure/Persistence/Mappers/Auth/RoleMapper.ts";
import { sequelize } from "#Infrastructure/Persistence/AppDBContext.ts";

export class RoleServiceQuery {
  private generic: GenericQueryService<any, any>;

  constructor() {
    this.generic = new GenericQueryService(
      RoleMstr,
      RoleMapper.toFlatBase,
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
    if (column && RoleMstr.rawAttributes[column]) {
      options.where = {
        ...options.where,
        [Op.and]: where(fn("LOWER", col(column)), { [Op.like]: searchPattern }),
      };
      return options;
    }
    // const keyNam = DatabaseNamingConvention.getName("RoleMstr");
    const keyNam = "RoleMstr";
    const rolNam = DatabaseNamingConvention.getName("RoleName");
    options.subQuery = false;
    options.where = {
      ...options.where,
      [Op.or]: [
        
        where(fn("LOWER", col(`${keyNam}.${rolNam}`)), { [Op.like]: searchPattern }),
        // where(fn("LOWER", col("Profile.Firstname")), { [Op.like]: searchPattern }),
      ],
    };

    return options;
  }

  // ------------------------
  // Sorting logic
  // ------------------------
  private applySorting(options: any, sortBy?: string, descending = false): any {
    if (sortBy && RoleMstr.rawAttributes[sortBy]) {
      options.order = [[sortBy, descending ? "DESC" : "ASC"]];
    } else {
      options.order = [[DatabaseNamingConvention.getName("roleId"), "DESC"]];
    }
    return options;
  }

  // ------------------------
  // List Users (with pagination + search + sorting)
  // ------------------------
  async listRoles(
    page = 1,
    pageSize = 10,
    search?: string,
    column?: string,
    sortBy?: string,
    descending = false,
    access?: string
  ): Promise<PaginatedResponse> {
    // For Joins
    const withJoinsAndIncludes = (options: any) => {
      //From associate of RoleMstr
      options.include = [
        {
          association: "RoleUsers",  // as
          attributes: [],
          required: false,
        },
        {
          association: "RoleModules",
          attributes: [],
          required: false,
        },
      ];
      return options;
    };
  // 🔹 Wrap in managed transaction
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
  async getRole(roleId: number) {
    return sequelize.transaction(async (tx) => {
      const user = await RoleMstr.findByPk(roleId, {
        transaction: tx, // ✅ ensures connection is released
      });
      return user ? RoleMapper.toFlatBase(user) : null;
    });
  }
}
