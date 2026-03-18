// ----------------------------
// Error body
// ----------------------------
export interface ErrorBody {
  statusText: string
}

export interface ErrorSchema {
  status_code: number
  body: string
}

// ----------------------------
// API return types
// ----------------------------
export interface ApiReturn<T = any> {
  success: boolean
  message?: string | null
  data: T
}

// NamedTuple equivalents
export class NTApiReturn<T = any> {
  success: boolean
  message?: string | null
  data?: T | null

  constructor(success: boolean, message?: string | null, data?: T | null) {
    this.success = success
    this.message = message ?? null
    this.data = data ?? null
  }

  static success<T>(message: string, data?: T): NTApiReturn<T> {
    return new NTApiReturn<T>(true, message, data ?? null)
  }

  static failure<T>(message: string, data?: T): NTApiReturn<T> {
    return new NTApiReturn<T>(false, message, data ?? null)
  }
}

// DB return equivalent
export class NTDbReturn {
  success: boolean
  message?: string | null

  constructor(success: boolean, message?: string | null) {
    this.success = success
    this.message = message ?? null
  }
}

// Optional BaseResponse
export class BaseResponse<T = any> {
  success: boolean
  message?: string | null
  data?: T | string | null

  constructor(success: boolean, message?: string | null, data?: T | string | null) {
    this.success = success
    this.message = message ?? null
    this.data = data ?? null
  }
}

// ----------------------------
// Paginated Response
// ----------------------------
export class PaginatedResponse<T = any> {
  page: number
  limit: number
  total: number
  items: T[]
  access?: string | null
  inactive?: number

  constructor(
    page: number,
    limit: number,
    total: number,
    items: T[],
    access?: string | null,
    inactive?: number
  ) {
    this.page = page
    this.limit = limit
    this.total = total
    this.items = items
    this.access = access ?? null
    this.inactive = inactive ?? 0
  }
}
