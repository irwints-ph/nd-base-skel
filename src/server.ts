// ==================================================================
// 🧩 src/server.ts
// ==================================================================
import { createApp } from "./app.ts";
import { setupDatabase, shutdownDatabase } from "@Infrastructure/Persistence/AppDBContext.ts";
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { logger } from "@Infrastructure/Core/Logger.ts";
import { getPortArg } from "./main_functions.ts";
import { showCfgLogs } from "./main_cfg_logs.ts";

export async function startServer() {
  const app = createApp();

  const cliPort = getPortArg(process.argv);
  const PORT = cliPort || Number(process.env.PORT) || EnvConfig.PORT || 3000;
  const HOST = process.env.HOST || "0.0.0.0";

  logger.info("🚀 Starting API server...");

  try {
    const ready = await setupDatabase();
    if (!ready) {
      logger.error("❌ Database not ready");
      process.exit(1);
    }
  } catch (err) {
    console.error("🔥 Startup error:", err);
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    showCfgLogs(server, HOST, PORT);
  });

  // Graceful shutdown
  ["SIGINT", "SIGTERM"].forEach(signal => {
    process.on(signal, async () => {
      console.log(`➜ Received ${signal}, shutting down...`);
      try {
        await shutdownDatabase();
        server.close(() => {
          console.log("⚡ Server closed");
          process.exit(0);
        });
      } catch (err) {
        console.error("❌ Shutdown error:", err);
        process.exit(1);
      }
    });
  });
}

