export class UnauthorizedError extends Error {
  public statusCode: number

  constructor(message?: string) {
    super(message || "Unauthorized")
    this.name = "UnauthorizedError"
    this.statusCode = 401

    // Set the prototype explicitly (needed for custom errors in TS)
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}
