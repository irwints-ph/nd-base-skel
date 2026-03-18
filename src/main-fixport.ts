// src/main.ts

import express from "express";
// import cors from "cors";
import { corsMiddleware } from "@Api/Middleware/cors.middleware.ts"
import { ErrorHandler, GlobalInterceptor, NotFoundHandler } from "@Api/Middleware/GlobalInterceptor.ts";

import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { logger } from "@Infrastructure/Core/Logger.ts";
import { setupDatabase, shutdownDatabase } from '@Infrastructure/Core/sequelize.ts'

import AuthRoute from "@Api/Controllers/Base/AuthController.ts";
import { HomeRoute } from "@Api/Routes/HomeRoutes.ts";
import { UserRoute } from "@Api/Routes/UserRoutes.ts";
import { ModuleRoute } from "@Api/Routes/ModuleRoutes.ts";
// import ModuleRoute from "@Api/Controllers/Base/ModulesController.ts";
// import OtpRoute from "@Api/Controllers/Base/OtpController.ts";
// import RoleRoute from "@Api/Controllers/Base/RolesController.ts";
// import RoleModuleRoute from "@Api/Controllers/Base/RoleModulesController.ts";
// import UserRoleRoute from "@Api/Controllers/Base/RoleUserController.ts";


const app = express();
// ----------------------------
// Core middleware
// ----------------------------
app.use(express.json());

app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(corsMiddleware);


// /* --------------------------------
//    Global Middleware
// -------------------------------- */
app.use(GlobalInterceptor);

/* --------------------------------
   Routes
-------------------------------- */
app.use("/api/auth", AuthRoute);
app.use("/", HomeRoute);
app.use("/api/users", UserRoute);
app.use("/api/modules", ModuleRoute);
// app.use("/api/otp", OtpRoute);
// app.use("/api/roles", RoleRoute);
// app.use("/api/roles/modules", RoleModuleRoute);
// app.use("/api/users", UserRoleRoute);

// Attach JSON error handlers at the end
app.use(NotFoundHandler);
app.use(ErrorHandler);
// /* --------------------------------
//    Global Error Handler
// -------------------------------- */
// app.use((err: any, req: any, res: any, next: any) => {
//   logger.error(err);

//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || "Internal Server Error",
//     errors: err.errors || [],
//   });
// });

/* --------------------------------
   Startup
-------------------------------- */
const PORT = EnvConfig.PORT || 3000;
  logger.info('🚀 Starting API server...');
  try {
    const ready = await setupDatabase() // ⚡ now returns boolean
    if (!ready) {
      logger.error('❌ Database not ready. Check DB connection and schema.');
      process.exit(1);
    }
  } catch (err) {
    console.error('🔥 Top-level start() error:', err);
    logger.error('❌ Failed to start server', err);
    process.exit(1);
  }

app.listen(PORT, () => {
  logger.info(`🚀 API (node) listening on http://localhost:${PORT}`);
  logger.info(
    "⚡ Environment: '%s' | 📋 file(s) %s | 💡 App Version: %s",
    EnvConfig.ENVIRONMENT,
    EnvConfig.loaded_env_file,
    EnvConfig.APIVERSION
  );

  logger.info("🌍 Allowed Hosts: %s", EnvConfig.BACKEND_CORS_ORIGINS);

  logger.info(
    "🔑 OIDC: %s, %s | 🪪 Auto Create: %s",
    EnvConfig.oidc.subdomain,
    EnvConfig.oidc.client_id,
    EnvConfig.oidc.auto_create
  );

  // logger.info("👁️ Audit Enabled: %s", EnvConfig.admin.audit_enabled);

  // logger.info(`🚀 Server running on port ${PORT}`);
});


// Graceful shutdown
["SIGINT", "SIGTERM"].forEach(signal => {
  process.on(signal, async () => {
    logger.info(`🔹 Received ${signal}, shutting down gracefully...`);
    await shutdownDatabase();   // revert WAL and close Sequelize
    process.exit(0);
  });
});

export default app;