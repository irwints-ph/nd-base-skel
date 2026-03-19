// ===================================================================
// 🟢 src/02-Application/Queries/Base/UserQueryService.ts
// ===================================================================
import { Op, fn, col, where } from "sequelize";

import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
import ContactMstr from "@Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import SsoKey from "@Infrastructure/Persistence/Models/Base/SsoKey.ts";
import UserProfile from "@Infrastructure/Persistence/Models/Base/UserProfile.ts";
import { UserDtoMapper } from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { GenericQueryService } from "@Infrastructure/Persistence/Queries/GenericQueryService.ts";
import { PaginatedResponse } from "@Contracts/Common/BaseSchema.ts";

export class UserQueryService {
  private generic: GenericQueryService<any, any>;

  constructor() {
    this.generic = new GenericQueryService(
      UserMstr,
      UserDtoMapper.toOrmUserFlatBase,
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
    // const dialect = (UserMstr.sequelize as Sequelize).getDialect();
    // const likeOp = dialect === "postgres" ? Op.iLike : Op.like;
    if (column && UserMstr.rawAttributes[column]) {
      options.where = {
        ...options.where,
        // [column]: { [likeOp]: searchPattern },
        [Op.and]: where(fn("LOWER", col(column)), { [Op.like]: searchPattern }),
      };
      return options;
    }

    options.include = [
      { model: UserProfile, as: "Profile" },
      { model: ContactMstr, as: "Contacts" },
    ];
    options.subQuery = false;
    options.where = {
      ...options.where,
      [Op.or]: [
        // { "$UserMstr.Username$": { [Op.like]: searchPattern } },
        // { "$Profile.Firstname$": { [Op.like]: searchPattern } },        
        where(fn("LOWER", col("UserMstr.Username")), { [Op.like]: searchPattern }),
        where(fn("LOWER", col("Profile.Firstname")), { [Op.like]: searchPattern }),
        where(fn("LOWER", col("Profile.Lastname")), { [Op.like]: searchPattern }),
        where(fn("LOWER", col("Contacts.ContactValue")), { [Op.like]: searchPattern }),
      ],
    };

    return options;
  }

  // ------------------------
  // Sorting logic
  // ------------------------
  private applySorting(options: any, sortBy?: string, descending = false): any {
    if (sortBy && UserMstr.rawAttributes[sortBy]) {
      options.order = [[sortBy, descending ? "DESC" : "ASC"]];
    } else {
      options.order = [["UserId", "DESC"]];
    }
    return options;
  }

  // ------------------------
  // List Users (with pagination + search + sorting)
  // ------------------------
  async listUsers(
    page = 1,
    pageSize = 10,
    search?: string,
    column?: string,
    sortBy?: string,
    descending = false,
    access?: string
  ): Promise<PaginatedResponse> {
    const withJoinsAndIncludes = (options: any) => {
      options.include = [
        { model: UserProfile, as: "Profile" },
        { model: SsoKey, as: "Sso" },
        { model: ContactMstr, as: "Contacts" },
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
  // Get Single User
  // ------------------------
  async getUser(userId: number) {
    const user = await UserMstr.findByPk(userId, {
      include: [
        { model: UserProfile, as: "Profile" },
        { model: SsoKey, as: "Sso" },
        { model: ContactMstr, as: "Contacts" },
      ],
    });
    return user ? UserDtoMapper.toOrmUserFlatBase(user) : null;
  }
}
