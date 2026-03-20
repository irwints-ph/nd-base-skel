// ===================================================================
// 🟢 src/04-Infrastructure/Persistence/Queries/GenericQueryService.ts
// ===================================================================
import { FindOptions, Model, Op, Transaction } from "sequelize";
import { PaginatedResponse } from "@Contracts/Common/BaseSchema.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";

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

  private logPoolStatus(label: string) {
    const pool = this.model.sequelize.connectionManager.pool;
    console.log(`⏱️ [Pool ${label}]`, {
      size: pool.size,
      available: pool.available,
      pending: pool.pending,
      max: pool.max,
    });
  }
  async getAsync(
    page = 1,
    pageSize = 10,
    search?: string,
    column?: string,
    sortBy?: string,
    descending = false,
    additionalFilters?: (options: FindOptions) => FindOptions,
    exclude?: Array<Record<string, any>>,
    access?: string,
    transaction?: Transaction // optional, provided by caller
  ): Promise<PaginatedResponse<R>> {
    page = Math.max(page, 1);
    pageSize = Math.max(1, Math.min(pageSize, 100));

    let options: FindOptions = { where: {} };
    const primaryKeys = Object.keys(this.model.primaryKeys);

    // Apply filters
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

    if (exclude && exclude.length > 0) {
      options.where = {
        [Op.and]: [
          options.where || {},
          { [Op.not]: exclude },
        ],
      };
    }

    if (search && this.applySearch) {
      options = this.applySearch(options, search, column);
    }

    if (this.applySorting) {
      options = this.applySorting(options, sortBy, descending);
    } else if (sortBy && this.model.rawAttributes[sortBy]) {
      options.order = [[sortBy, descending ? "DESC" : "ASC"]];
    } else if (primaryKeys.length > 0) {
      const pkey = DatabaseNamingConvention.getName(primaryKeys[0]);
      options.order = [[pkey, "DESC"]];
    }

    options.offset = (page - 1) * pageSize;
    options.limit = pageSize;

    // Log pool before query
    this.logPoolStatus("BEFORE query");
    const startTime = Date.now();

    let rows: T[];
    let count: number;

    try {
      // 🔹 Step 1: fetch rows + count from DB
      const result = await this.model.findAndCountAll({
        ...options,
        distinct: true,
        transaction, // optional
      });

      rows = result.rows;
      count = result.count;

      // 🔹 Step 2: immediately release DB connection
      // Once `await findAndCountAll` resolves, connection is returned to pool
    } catch (err) {
      this.logPoolStatus("ON ERROR");
      console.error("❌ Query failed:", err);
      throw err;
    }

    const endTime = Date.now();
    this.logPoolStatus("AFTER query");
    console.log(`⏱️ Query executed in ${endTime - startTime} ms`);

    // 🔹 Step 3: map results **after connection is released**
    const items = rows.map((r: T) => this.mapFn(r));

    return {
      page,
      limit: pageSize,
      total: count,
      items,
      access,
    };
  }

  // async getAsync(
  //   page = 1,
  //   pageSize = 10,
  //   search?: string,
  //   column?: string,
  //   sortBy?: string,
  //   descending = false,
  //   additionalFilters?: (options: FindOptions) => FindOptions,
  //   exclude?: Array<Record<string, any>>,
  //   access?: string,
  //   transaction?: Transaction // ✅ optional, provided by caller
  // ): Promise<PaginatedResponse<R>> {
  //   page = Math.max(page, 1);
  //   pageSize = Math.max(1, Math.min(pageSize, 100));

  //   let options: FindOptions = { where: {} };
  //   const primaryKeys = Object.keys(this.model.primaryKeys);

  //   // 🔹 Apply filters, search, sorting, pagination (same as before)
  //   if (additionalFilters) {
  //     const modified = additionalFilters(options);
  //     options = {
  //       ...options,
  //       ...modified,
  //       where: {
  //         [Op.and]: [options.where || {}, modified.where || {}],
  //       },
  //     };
  //   }

  //   if (exclude && exclude.length > 0) {
  //     options.where = {
  //       [Op.and]: [
  //         options.where || {},
  //         { [Op.not]: exclude },
  //       ],
  //     };
  //   }

  //   if (search && this.applySearch) {
  //     options = this.applySearch(options, search, column);
  //   }

  //   if (this.applySorting) {
  //     options = this.applySorting(options, sortBy, descending);
  //   } else if (sortBy && this.model.rawAttributes[sortBy]) {
  //     options.order = [[sortBy, descending ? "DESC" : "ASC"]];
  //   } else if (primaryKeys.length > 0) {
  //     const pkey = DatabaseNamingConvention.getName(primaryKeys[0]);
  //     options.order = [[pkey, "DESC"]];
  //   }

  //   options.offset = (page - 1) * pageSize;
  //   options.limit = pageSize;

  //   // 🔹 Use provided transaction
  //   this.logPoolStatus("BEFORE query");
  //   const startTime = Date.now();

  //   let rows: T[];
  //   let count: number;

  //   try {
  //     const result = await this.model.findAndCountAll({
  //       ...options,
  //       distinct: true,
  //       transaction, // ✅ use caller’s transaction
  //     });
  //     rows = result.rows;
  //     count = result.count;
  //   } catch (err) {
  //     this.logPoolStatus("ON ERROR");
  //     console.error("❌ Query failed:", err);
  //     throw err;
  //   }

  //   const endTime = Date.now();
  //   this.logPoolStatus("AFTER query");
  //   console.log(`⏱️ Query executed in ${endTime - startTime} ms`);

  //   const items = rows.map((r: T) => this.mapFn(r));

  //   return {
  //     page,
  //     limit: pageSize,
  //     total: count,
  //     items,
  //     access,
  //   };
  // }
}