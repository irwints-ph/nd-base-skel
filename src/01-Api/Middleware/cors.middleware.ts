import { Request, Response, NextFunction } from "express"

export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const origin = req.headers.origin as string | undefined

  const rawOrigins =
    process.env.BACKEND_CORS_ORIGINS || ""

  const allowedOrigins = rawOrigins
    .split(",")
    .map(o =>
      o.trim()
        .replace(/\/$/, "")
        .toLowerCase()
    )
    .filter(Boolean)

  const normalizedOrigin = origin
    ?.trim()
    .replace(/\/$/, "")
    .toLowerCase()

  console.log({
    origin,
    normalizedOrigin,
    allowedOrigins
  })

  if (allowedOrigins.length > 0) {
    if (
      normalizedOrigin &&
      allowedOrigins.includes(normalizedOrigin)
    ) {
      res.header("Access-Control-Allow-Origin", origin)
      res.header("Access-Control-Allow-Credentials", "true")
      res.header("Vary", "Origin")
    }
  } else {
    if (origin) {
      res.header("Access-Control-Allow-Origin", origin)
      res.header("Access-Control-Allow-Credentials", "true")
      res.header("Vary", "Origin")
    }
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  )

  res.header(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "*"
  )
  // res.header(
  //   "Access-Control-Allow-Headers",
  //   "Content-Type, Authorization, X-Client-Id, X-Client-Secret, X-Comp-Name, X-Frontend-Port"
  // )

  if (req.method === "OPTIONS") {
    return res.sendStatus(204)
  }

  next()
}