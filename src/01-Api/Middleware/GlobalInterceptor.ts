// src/middleware/globalInterceptor.ts
import { Request, Response, NextFunction } from "express";
// import { IAuthQueryService } from "@Domain/Interfaces/Auth/IAuthQueryService.ts";
import { AuthQueryService } from "@Application/Queries/Auth/AuthQueryService.ts";
// import { sequelize } from "@Infrastructure/Core/sequelize.ts";
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";
import { logger } from "@Infrastructure/Core/Logger.ts";
import { EnvConfig } from '@Infrastructure/Core/Config.ts'

import { getActiveUser } from "@Infrastructure/Auth/RequestUtils.ts"

//Put only thos that doen't need user detrails /Authorization
const PUBLIC_PATHS = [
  "/docs",
  "/openapi.json",
  "/favicon.ico",
  "/redoc",
  "/health",
  "/api/modules/routes",   //Just allow. User details will be set in routeHandler
  "/api/users/info",       //Allow also from OneLogin. User details will be set in routeHandler
];

const PUBLIC_PREFIXES = [
  "/api/otp",
  "/api/auth",
];

export async function GlobalInterceptor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const path = req.path;
    const method = req.method.toUpperCase();
    logger.info(`➡️  Incoming request: ${method} ${path}`);

    // Skip exact public paths
    if (PUBLIC_PATHS.includes(path)) return next();

    // Skip prefix-based public paths
    if (PUBLIC_PREFIXES.some(p => path.startsWith(p))) {
      logger.info(`[Middleware] Skipping authorization for ${path}`);
      return next();
    }

    // ----------------------------
    // Get current user from request (custom auth middleware should populate req.currentUser)
    // ----------------------------
    // const user = req.currentUser;
    const user = await getActiveUser(req)
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No active user",
      });
    }
    // ✅ attach once to be avaialbe in all request
    (req as any).currentUser = user;

    // Super root bypass
    if (user.userId === EnvConfig.admin.superRoot) {
      return next();
    }
    // logger.info(`[Middleware] skipping for Username ${user.userId} unit IModuleRepository and others are created`);
    // ----------------------------
    // Load user modules via AuthQueryService
    // ----------------------------
    const authService = new AuthQueryService(sequelize);;
    const userModules = await authService.getAuthorizedModulesByUser(user.userId);

    // ----------------------------
    // Determine controller name from path
    // Remove '/api' prefix if present
    // ----------------------------
    const segments = path.replace(/^\/+/, "").split("/");
    if (segments[0] === "api") segments.shift();
    const controllerName = segments[0];
    if (!controllerName) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Missing controller metadata",
      });
    }

    // ----------------------------
    // Check access
    // ----------------------------
    const curControllerName = controllerName.toLowerCase();
    const allowed = userModules.some(
      mod =>
        mod.controllerName?.toLowerCase() === curControllerName &&
        mod.authorization[0] === "Y"
    );

    if (!allowed) {
      logger.error(`[Middleware] Access denied to path ${method} ${path} for user ID ${user.userId}`);
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied to ${method} ${curControllerName} module`,
      });
    }

    // ----------------------------
    // Continue to next middleware / route
    // ----------------------------
    next();
  } catch (err: any) {
    logger.error(`Authorization failed: ${err.message}`);
    res.status(500).json({
      success: false,
      message: `Internal server error: ${err.message}`,
    });
  }
}

// ----------------------------
// Global JSON error handlers
// ----------------------------

// 404 handler
export function NotFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
}

// General error handler
export function ErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error(`Unhandled error: ${err.message}`, err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
}
export async function timingInterceptor(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint(); // high-res timer
  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000; // convert to ms
    logger.info(`⏱️  ${req.method} ${req.originalUrl} took ${durationMs.toFixed(2)} ms`);
  });

  next();
}