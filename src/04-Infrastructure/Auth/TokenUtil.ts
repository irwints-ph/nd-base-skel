import type { Request } from "express"
import { UnauthorizedError } from "./errors/UnauthorizedError.ts"

// ----------------------------
// Extract Bearer token from request
// ----------------------------
export function GetBearerToken(req: Request): string {
  let authHeader = req.headers["authorization"] || req.headers["Authorization"]

  if (Array.isArray(authHeader)) authHeader = authHeader[0]

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Invalid or missing Authorization header")
  }

  return authHeader.replace("Bearer ", "").trim()
}

// ----------------------------
// Full token (just split on space)
// ----------------------------
export function GetFullToken(req: Request): string {
  let authHeader = req.headers["authorization"] || req.headers["Authorization"]

  if (Array.isArray(authHeader)) authHeader = authHeader[0]

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Missing Authorization header")
  }

  const parts = authHeader.split(" ")
  return parts[1]
}
