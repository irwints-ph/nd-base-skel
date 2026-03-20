import { Server } from "http";
import { logger } from "@Infrastructure/Core/Logger.ts";
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { getLocalNetworkIPs } from "main_functions.ts";
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts"; // ✅ import sequelize

export function showCfgLogs(server: Server, HOST: string, PORT: string | number): void {
  const addressInfo = server.address();
  const host = typeof addressInfo === "object" && addressInfo ? addressInfo.address : HOST;
  const port = typeof addressInfo === "object" && addressInfo ? addressInfo.port : PORT;

  const localIPs = getLocalNetworkIPs();

  displayShow(`🚀 Server is listening on:`);

  // Local access
  displayShow(`   ➜ Local:   http://localhost:${port}`);

  // Actual bind address
  displayShow(`   ➜ Bound:   http://${host}:${port}`);

  // Network access
  if (localIPs.length > 0) {
    displayShow(`   ➜ Network:`);
    localIPs.forEach(ip => displayShow(`      http://${ip}:${port}`));
  }

  displayShow(
    "⚡ Environment: '%s' | 📋 file(s) %s | 💡 App Version: %s",
    EnvConfig.ENVIRONMENT,
    EnvConfig.loaded_env_file,
    EnvConfig.APIVERSION
  );

  // DB info from EnvConfig
  displayShow(`🛢️  Type: ${EnvConfig.database.type} | Name: ${EnvConfig.database.name} | Show SQL: ${EnvConfig.database.showSql}`);
  if (EnvConfig.database.type !== "sqlite") {
    displayShow(`🛢️  Host: ${EnvConfig.database.host}:${EnvConfig.database.port} | User: ${EnvConfig.database.user}`);
  }

  // ✅ Display Sequelize runtime options including pool & dialectOptions
  try {
    const options = (sequelize as any).options ?? {};
    if (options.pool) {
      displayShow(`   ➜  DB Pool: max=${options.pool.max}, min=${options.pool.min}, idle=${options.pool.idle}, acquire=${options.pool.acquire}, evict=${options.pool.evict}`);
    }
    if (options.dialectOptions) {
      displayShow(`   ➜  Dialect Options: ${JSON.stringify(options.dialectOptions)}`);
    }
  } catch (err) {
    logger.warn("Unable to read Sequelize runtime options:", err);
  }

  logger.info("🌍 Allowed Hosts: %s", EnvConfig.BACKEND_CORS_ORIGINS);

  displayShow(
    "🔑 OIDC: %s, %s | 🪪  Auto Create: %s",
    EnvConfig.oidc.subdomain,
    EnvConfig.oidc.client_id,
    EnvConfig.oidc.auto_create
  );

  const adminSettingsLines = Object.entries(EnvConfig.admin).map(
    ([key, value]) => `   ➜  ${key}: ${value}`
  );
  displayShow(["🛠️  Admin Settings:", ...adminSettingsLines]);
}

export function displayShow(msg: string | string[], ...args: any[]) {
  if (Array.isArray(msg)) {
    msg.forEach(line => logger.info(line));
  } else if (args.length > 0) {
    logger.info(msg.replace(/%s/g, () => String(args.shift())));
  } else {
    logger.info(msg);
  }
}
// import { Server } from "http";
// // import { Server as HttpsServer } from "https";
// import { logger } from "@Infrastructure/Core/Logger.ts";
// import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
// import { getLocalNetworkIPs} from "main_functions.ts";

// export function showCfgLogs(server:Server, HOST:string, PORT:string | number): void {
//   const addressInfo = server.address();
//   const host = typeof addressInfo === "object" && addressInfo ? addressInfo.address : HOST;
//   const port = typeof addressInfo === "object" && addressInfo ? addressInfo.port : PORT;

//   const localIPs = getLocalNetworkIPs();

//   displayShow(`🚀 Server is listening on:`);

//   // Local access
//   displayShow(`   ➜ Local:   http://localhost:${port}`);

//   // Actual bind address
//   displayShow(`   ➜ Bound:   http://${host}:${port}`);

//   // const hostPorts = localIPs.map(ip => `     ➜  http://${ip}:${port}`);
//   // displayShow(["   ➜  Network::", ...hostPorts]);
//   if (localIPs.length > 0) {
//     displayShow(`   ➜ Network:`);
//     localIPs.forEach(ip => displayShow(`      http://${ip}:${port}`));
//   }

//   displayShow(
//     "⚡ Environment: '%s' | 📋 file(s) %s | 💡 App Version: %s",
//     EnvConfig.ENVIRONMENT,
//     EnvConfig.loaded_env_file,
//     EnvConfig.APIVERSION
//   );
//   displayShow(`🛢️  Type: ${EnvConfig.database.type} | Name: ${EnvConfig.database.name}  | Show: ${EnvConfig.database.showSql}`);
//   if (EnvConfig.database.type !== "sqlite") {
//     displayShow(`🛢️  Host: ${EnvConfig.database.host}:${EnvConfig.database.port} | User: ${EnvConfig.database.user}`);
//   }

//   // logger.info("🌍 Allowed Hosts: %s", EnvConfig.BACKEND_CORS_ORIGINS);
//   logger.info("🌍 Allowed Hosts: %s", EnvConfig.BACKEND_CORS_ORIGINS);
//   displayShow(
//     "🔑 OIDC: %s, %s | 🪪  Auto Create: %s",
//     EnvConfig.oidc.subdomain,
//     EnvConfig.oidc.client_id,
//     EnvConfig.oidc.auto_create
//   );
//   const adminSettingsLines = Object.entries(EnvConfig.admin).map(
//     ([key, value]) => `   ➜  ${key}: ${value}`
//   );
//   // displayShow("🛠️  Admin Settings: %s", adminSettingsLines);
//   // logger.info("🛠️  Admin Settings: %s", adminSettingsLines);
//   displayShow(["🛠️  Admin Settings:", ...adminSettingsLines]);
//   // displayShow(`🛠️  Admin Settings: ${JSON.stringify(EnvConfig.admin)}`);
  
//   // logger.info("👁️ Audit Enabled: %s", EnvConfig.admin.audit_enabled);
//   // logger.info(`🚀 Server running on port ${PORT}`);

// }

// export function displayShow(msg: string | string[], ...args: any[]) {
//   if (Array.isArray(msg)) {
//     msg.forEach(line => logger.info(line));
//   } else if (args.length > 0) {
//     // support printf-style formatting
//     // logger.info(msg);
//     logger.info(msg.replace(/%s/g, () => String(args.shift())));
//     // console.log(msg.replace(/%s/g, () => String(args.shift())));
//   } else {
//     logger.info(msg);
//     // console.log(msg);
//   }
// }