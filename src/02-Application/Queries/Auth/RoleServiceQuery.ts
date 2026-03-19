// src/application/queries/auth/RoleServiceQuery.ts
import { Op, WhereOptions, Order } from "sequelize";
import RoleMstr from "@Infrastructure/Persistence/Models/Auth/RoleMstr.ts";
import { RoleMapper } from "@Infrastructure/Persistence/Mappers/Auth/RoleMapper.ts";
import { PaginatedResponse } from "@Contracts/Common/BaseSchema.ts";

export class RoleServiceQuery {
  private applySearch(search?: string): WhereOptions {
    if (!search) return {};
    return {
      RoleName: {
        [Op.iLike]: `%${search.toLowerCase()}%`,
      },
    };
  }

  private applySorting(sortBy?: string, descending?: boolean): Order {
    if (sortBy && (RoleMstr as any).rawAttributes[sortBy]) {
      return [[sortBy, descending ? "DESC" : "ASC"]];
    }
    return [["RoleName", "ASC"]];
  }

  async listRoles(
    page: number = 1,
    limit: number = 10,
    search?: string,
    column?: string, // not used here, but kept for parity
    sortBy?: string,
    descending: boolean = false
  ): Promise<PaginatedResponse> {
    const where = this.applySearch(search);
    const order = this.applySorting(sortBy, descending);

    const offset = (page - 1) * limit;
    const { rows, count } = await RoleMstr.findAndCountAll({
      where,
      order,
      offset,
      limit: limit,
    });

    const items = rows.map(r => RoleMapper.toFlatBase(r));

    return {
      page,
      limit,
      total: count,
      items,
      // totalPages: Math.ceil(count / limit),
    };
  }

  async getRole(roleId: number) {
    const role = await RoleMstr.findByPk(roleId);
    if (!role) return null;
    return RoleMapper.toFlatBase(role);
  }
}
