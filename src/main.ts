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
import { RoleRoute } from "@Api/Routes/RoleRoutes.ts";


// import OtpRoute from "@Api/Controllers/Base/OtpController.ts";
// import RoleModuleRoute from "@Api/Controllers/Base/RoleModulesController.ts";
// import UserRoleRoute from "@Api/Controllers/Base/RoleUserController.ts";
import { getPortArg} from "main_functions.ts";
import { showCfgLogs } from "main_cfg_logs.ts";

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
app.use("/api/roles", RoleRoute);

// app.use("/api/roles/modules", RoleModuleRoute);
// app.use("/api/users", UserRoleRoute);
// app.use("/api/otp", OtpRoute);

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
// const PORT = EnvConfig.PORT || 3000;
const cliPort = getPortArg(process.argv)

const PORT =
  cliPort ||
  Number(process.env.PORT) ||
  EnvConfig.PORT ||
  3000

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
const HOST = process.env.HOST || "0.0.0.0";
const server = app.listen(PORT, () => {
  showCfgLogs(server, HOST, PORT);
});


// Graceful shutdown
["SIGINT", "SIGTERM"].forEach(signal => {
  process.on(signal, async () => {
    console.log(`🔹 Received ${signal}, shutting down gracefully...`);
    await shutdownDatabase();   // revert WAL and close Sequelize
    process.exit(0);
  });
});

export default app;