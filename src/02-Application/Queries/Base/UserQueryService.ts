// ===================================================================
// 🟢 src/02-Application/Queries/Base/UserQueryService.ts
// ===================================================================
import { Op, fn, col, where, Transaction } from "sequelize";

import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
import ContactMstr from "@Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import SsoKey from "@Infrastructure/Persistence/Models/Base/SsoKey.ts";
import UserProfile from "@Infrastructure/Persistence/Models/Base/UserProfile.ts";
import { UserDtoMapper } from "@Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { GenericQueryService } from "@Infrastructure/Persistence/Queries/GenericQueryService.ts";
import { PaginatedResponse } from "@Contracts/Common/BaseSchema.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";

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
    const keyNam = "UserMstr";
    const conVal = DatabaseNamingConvention.getName("ContactValue");;
    const usrNam = DatabaseNamingConvention.getName("Username");
    const fstNam = DatabaseNamingConvention.getName("Firstname");
    const lstNam = DatabaseNamingConvention.getName("Lastname");

    options.subQuery = false;
    options.where = {
      ...options.where,
      [Op.or]: [
        // { "$UserMstr.Username$": { [Op.like]: searchPattern } },
        // { "$Profile.Firstname$": { [Op.like]: searchPattern } },
        where(fn("LOWER", col(`${keyNam}.${usrNam}`)), { [Op.like]: searchPattern }),
        where(fn("LOWER", col(`${"Profile"}.${fstNam}`)), { [Op.like]: searchPattern }),
        where(fn("LOWER", col(`${"Profile"}.${lstNam}`)), { [Op.like]: searchPattern }),
        where(fn("LOWER", col(`${"Contacts"}.${conVal}`)), { [Op.like]: searchPattern }),
        // where(fn("LOWER", col("UserMstr.Username")), { [Op.like]: searchPattern }),
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
  async getUser(userId: number) {
    return sequelize.transaction(async (tx: Transaction) => {
      const user = await UserMstr.findByPk(userId, {
        include: [
          { model: UserProfile, as: "Profile" },
          { model: SsoKey, as: "Sso" },
          { model: ContactMstr, as: "Contacts" },
        ],
        transaction: tx, // ✅ safe connection usage
      });
      return user ? UserDtoMapper.toOrmUserFlatBase(user) : null;
    });

  }
}
