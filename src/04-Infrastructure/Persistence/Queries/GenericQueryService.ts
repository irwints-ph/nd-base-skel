// ===================================================================
// 🟢 src/04-Infrastructure/Persistence/Queries/GenericQueryService.ts
// ===================================================================
import { FindOptions, Model, Op } from "sequelize";
import { PaginatedResponse } from "@Contracts/Common/BaseSchema.ts";

type MapFn<T extends Model, R> = (entity: T) => R;

export class GenericQueryService<T extends Model, R> {
  private model: any;
  private mapFn: MapFn<T, R>;
  private applySearch?: (options: FindOptions, search: string, column?: string) => FindOptions;
  private applySorting?: (options: FindOptions, sortBy?: string, descending?: boolean) => FindOptions;

  constructor(
    model: any,
    mapFn: MapFn<T, R>,
    applySearch?: (options: FindOptions, search: string, column?: string) => FindOptions,
    applySorting?: (options: FindOptions, sortBy?: string, descending?: boolean) => FindOptions
  ) {
    this.model = model;
    this.mapFn = mapFn;
    this.applySearch = applySearch;
    this.applySorting = applySorting;
  }

  async getAsync(
    page = 1,
    pageSize = 10,
    search?: string,
    column?: string,
    sortBy?: string,
    descending = false,
    additionalFilters?: (options: FindOptions) => FindOptions,
    exclude?: Array<Record<string, any>>, // ✅ supports composite keys
    access?: string
  ): Promise<PaginatedResponse<R>> {
    page = Math.max(page, 1);
    pageSize = Math.max(1, Math.min(pageSize, 100));

    let options: FindOptions = { where: {} };

    const primaryKeys = Object.keys(this.model.primaryKeys);

    // ------------------------
    // Additional filters
    // ------------------------
    if (additionalFilters) {
      const modified = additionalFilters(options);

      options = {
        ...options,
        ...modified,
        where: {
          [Op.and]: [options.where || {}, modified.where || {}],
        },
      };
    }

    // ------------------------
    // Exclude (supports composite keys)
    // ------------------------
    if (exclude && exclude.length > 0) {
      options.where = {
        [Op.and]: [
          options.where || {},
          {
            [Op.not]: exclude,
          },
        ],
      };
    }

    // ------------------------
    // Search
    // ------------------------
    if (search && this.applySearch) {
      options = this.applySearch(options, search, column);
    }

    // ------------------------
    // Sorting
    // ------------------------
    if (this.applySorting) {
      options = this.applySorting(options, sortBy, descending);
    } else if (sortBy && this.model.rawAttributes[sortBy]) {
      options.order = [[sortBy, descending ? "DESC" : "ASC"]];
    } else if (primaryKeys.length > 0) {
      options.order = [[primaryKeys[0], "DESC"]];
    }

    // ------------------------
    // Pagination
    // ------------------------
    options.offset = (page - 1) * pageSize;
    options.limit = pageSize;

    // ------------------------
    // Query execution
    // ------------------------
    const { rows, count } = await this.model.findAndCountAll({
      ...options,
      distinct: true, // ✅ critical when joins are added
    });

    const items = rows.map((r: T) => this.mapFn(r));

    return {
      page,
      limit: pageSize,
      total: count,
      items,
      access,
    };
  }
}

// import { FindOptions, Model, Op, Sequelize } from "sequelize";
// import { PaginatedResponse } from "@Contracts/Common/BaseSchema.ts";

// type MapFn<T extends Model, R> = (entity: T) => R;

// export class GenericQueryService<T extends Model, R> {
//   private model: any;
//   private mapFn: MapFn<T, R>;
//   private applySearch?: (options: FindOptions, search: string, column?: string) => FindOptions;
//   private applySorting?: (options: FindOptions, sortBy?: string, descending?: boolean) => FindOptions;

//   constructor(
//     model: any,
//     mapFn: MapFn<T, R>,
//     applySearch?: (options: FindOptions, search: string, column?: string) => FindOptions,
//     applySorting?: (options: FindOptions, sortBy?: string, descending?: boolean) => FindOptions
//   ) {
//     this.model = model;
//     this.mapFn = mapFn;
//     this.applySearch = applySearch;
//     this.applySorting = applySorting;
//   }

//   // ------------------------
//   // Generic get with pagination (dialect aware)
//   // ------------------------
//   async getAsync(
//     page = 1,
//     pageSize = 10,
//     search?: string,
//     column?: string,
//     sortBy?: string,
//     descending = false,
//     additionalFilters?: (options: FindOptions) => FindOptions,
//     excludeIds?: number[],
//     access?: string
//   ): Promise<PaginatedResponse<R>> {
//     page = Math.max(page, 1);
//     pageSize = Math.max(1, Math.min(pageSize, 100));

//     let options: FindOptions = { where: {} };

//     // Apply additional filters
//     if (additionalFilters) {
//       options = additionalFilters(options);
//     }

//     // Exclude IDs
//     if (excludeIds && excludeIds.length > 0) {
//       options.where = {
//         ...options.where,
//         Id: { [Op.notIn]: excludeIds },
//       };
//     }

//     // Apply search
//     if (search) {
//       if (this.applySearch) {
//         options = this.applySearch(options, search, column);
//       }
//     }

//     // Apply sorting
//     if (this.applySorting) {
//       options = this.applySorting(options, sortBy, descending);
//     } else if (sortBy && this.model.rawAttributes[sortBy]) {
//       options.order = [[sortBy, descending ? "DESC" : "ASC"]];
//     } else {
//       options.order = [["Id", "DESC"]];
//     }

//     // Pagination
//     options.offset = (page - 1) * pageSize;
//     options.limit = pageSize;

//     // Detect dialect
//     // const dialect = (this.model.sequelize as Sequelize).getDialect();

//     let rows: T[];
//     let count: number;
//     rows = await this.model.findAll(options);
//     count = rows.length;

//     // if (dialect === "sqlite") {
//     //   rows = await this.model.findAll(options);
//     //   count = rows.length;
//     // } else {
//     //   const { cRows, cCount } = await this.model.findAndCountAll(options);
//     //   rows = cRows;
//     //   count = cCount;
//     //   // return { total: count, items: rows.map(this.mapFn), page, limit: pageSize, access };
//     // }

//     const items = rows.map((r: T) => this.mapFn(r));

//     return {
//       page,
//       limit: pageSize,
//       total: count,
//       items,
//       access,
//     };
//   }
// }
