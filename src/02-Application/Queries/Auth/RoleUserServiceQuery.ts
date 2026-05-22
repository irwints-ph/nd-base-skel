// ===================================================================
// 🟢 src/02-Application/Queries/Auth/RoleUserServiceQuery.ts
// ===================================================================
import { Op, fn, col, where, DataTypes } from "sequelize";
import { GenericQueryService } from "#Infrastructure/Persistence/Queries/GenericQueryService.ts";
import { PaginatedResponse } from "#Contracts/Common/BaseSchema.ts";

import RoleUserMstr from "#Infrastructure/Persistence/Models/Auth/RoleUserMstr.ts";
import { RoleUserMapper } from "#Infrastructure/Persistence/Mappers/Auth/RoleUserMapper.ts";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts";

export class RoleUserServiceQuery {
  private generic: GenericQueryService<any, any>;

  constructor() {
    this.generic = new GenericQueryService(
      RoleUserMstr,
      RoleUserMapper.toFlatBase,
      this.applySearch,
      this.applySorting
    );
  }

  // ------------------------
  // Search logic
  // ------------------------
  private applySearch(options: any, search: string, column?: string): any {
    if (!search) return options;

    const searchPattern = `%${search.toLowerCase()}%`;

    const normalizedColumn =
      column &&
      Object.keys(RoleUserMstr.rawAttributes).find(
        (key) => key.toLowerCase() === column.toLowerCase()
      );

    // ------------------------
    // Column-specific search (same as before)
    // ------------------------
    if (normalizedColumn) {
      const attr = RoleUserMstr.rawAttributes[normalizedColumn];

      if (attr.type instanceof DataTypes.INTEGER) {
        const num = Number(search);
        if (!isNaN(num)) {
          options.where = {
            [Op.and]: [options.where || {}, { [normalizedColumn]: num }],
          };
        }
        return options;
      }

      if (attr.type instanceof DataTypes.BOOLEAN) {
        options.where = {
          [Op.and]: [
            options.where || {},
            { [normalizedColumn]: search.toLowerCase() === "true" },
          ],
        };
        return options;
      }
    }

    // ------------------------
    // GLOBAL SEARCH (WITH JOINS)
    // ------------------------
    options.subQuery = false; // ✅ important for joins

    options.where = {
      [Op.and]: [
        options.where || {},
        {
          [Op.or]: [
            // Role.RoleName
            where(fn("LOWER", col(`Role.${DatabaseNamingConvention.getName("RoleName")}`)), {
              [Op.like]: searchPattern,
            }),

            // User.Username (adjust if different field)
            where(fn("LOWER", col(`User.${DatabaseNamingConvention.getName("Username")}`)), {
              [Op.like]: searchPattern,
            }),
          ],
        },
      ],
    };

    return options;
  }

  // ------------------------
  // Sorting logic
  // ------------------------
  private applySorting(options: any, sortBy?: string, descending = false): any {
    if (sortBy && RoleUserMstr.rawAttributes[sortBy]) {
      options.order = [[sortBy, descending ? "DESC" : "ASC"]];
    } else {
      options.order = [[DatabaseNamingConvention.getName("roleId"), "DESC"]];
    }
    return options;
  }

  // ------------------------
  // List User Roless (with pagination + search + sorting)
  // ------------------------
  async listUserRoless(
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
      options.include = [
        {
          association: "Role",  // as
          attributes: [],
          required: false,
        },
        {
          association: "User",
          attributes: [],
          required: false,
        },
      ];

      return options;
    };

    return await this.generic.getAsync(
      page,
      pageSize,
      search,
      column,
      sortBy,
      descending,
      withJoinsAndIncludes,
      undefined,
      access
    );
  }

  // ------------------------
  // Get Single User Role
  // ------------------------
  async getUserRole(roleId: number, userId: number) {
    // const userRole = await RoleUserMstr.findByPk([roleId, userId]);
    const userRole = await RoleUserMstr.findOne({
      where: { RoleId: roleId, UserId: userId },
    });    
    return userRole ? RoleUserMapper.toFlatBase(userRole) : null;
  }
}
