// src/infrastructure/http/cors.middleware.ts

import { Request, Response, NextFunction } from "express"

const rawOrigins = process.env.BACKEND_CORS_ORIGINS || ""

const allowedOrigins = rawOrigins
  .split(",")
  .map(o => o.trim())
  .filter(Boolean)

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const origin = req.headers.origin as string | undefined

  if (allowedOrigins.length > 0) {
    if (origin && allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin)
      res.header("Access-Control-Allow-Credentials", "true")
    }
  } else {
    // dev fallback
    res.header("Access-Control-Allow-Origin", "*")
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  )
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  )

  if (req.method === "OPTIONS") {
    return res.sendStatus(204)
  }

  next()
}
