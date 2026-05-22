// ==================================================================
// 🧩 src/main.ts
// ==================================================================
import express from "express";

import { corsMiddleware } from "#Api/Middleware/cors.middleware.ts";
import {
  ErrorHandler,
  GlobalInterceptor,
  NotFoundHandler,
  timingInterceptor,
} from "#Api/Middleware/GlobalInterceptor.ts";

import AuthRoute from "#Api/Controllers/Base/AuthController.ts";
import { HomeRoute } from "#Api/Routes/HomeRoutes.ts";
import { UserRoute } from "#Api/Routes/UserRoutes.ts";
import { ModuleRoute } from "#Api/Routes/ModuleRoutes.ts";
import { RoleRoute } from "#Api/Routes/RoleRoutes.ts";

// ------------------------------------------------------------------
// 🏗️ CREATE APP (USED BY TESTS + SERVER)
// ------------------------------------------------------------------
export function createApp() {
  const app = express();

  // Core middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(corsMiddleware);

  // Global middleware
  app.use(GlobalInterceptor);
  app.use(timingInterceptor);

  // Routes
  app.use("/api/auth", AuthRoute);
  app.use("/", HomeRoute);
  app.use("/api/users", UserRoute);
  app.use("/api/modules", ModuleRoute);
  app.use("/api/roles", RoleRoute);

  // Error handlers (ALWAYS LAST)
  app.use(NotFoundHandler);
  app.use(ErrorHandler);

  return app;
}