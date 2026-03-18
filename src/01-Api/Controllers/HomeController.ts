// ===================================================================
// 🟢 App/Api/Controllers/HomeController.ts
// ===================================================================

import { Request, Response } from "express";
import os from "os";

import { BaseApiController } from "./BaseApiController.ts"
// import { logger } from "@Infrastructure/Core/Logger.ts";
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";
import { Utils } from "@Infrastructure/Helpers/Utils.ts";
import { getSystemInfo } from "@Infrastructure/Helpers/SystemInfoHelper.ts";
import { GetHealthUseCase } from "@Application/Services/HealthService.ts";
import { IUserRepository } from "03-Domain/Interfaces/Base/IUserRepository.ts";
// import { ILogObj, Logger } from "tslog";


const APIVERSION = EnvConfig.APIVERSION;

export default class HomeController extends BaseApiController {

  constructor(
    // logger: Logger<ILogObj>,
    userRepo: IUserRepository
  ) {
    super(userRepo);
  }

  // ------------------------
  // Index
  // ------------------------
  async index(req: Request, res: Response) {

    const systemInfo = getSystemInfo();

    const allowedHosts = EnvConfig.BACKEND_CORS_ORIGINS.map(
      (o: string) => o.replace(/\/$/, "")
    );

    const info = {
      appVersion: APIVERSION,
      allowedFEHost: allowedHosts,
      ...systemInfo
    };

    return this.success(res, info);
  }

  // ------------------------
  // Health
  // ------------------------
  async health(req: Request, res: Response) {

    const environment = process.env.ENVIRONMENT ?? "Development";

    const systemInfo = getSystemInfo();

    const healthUseCase = new GetHealthUseCase(sequelize);
    const healthDetails = await healthUseCase.execute();

    const response = {
      status: healthDetails.IsHealthy ? "healthy" : "unhealthy",
      environment,
      appVersion: APIVERSION,
      sub: EnvConfig.oidc.subdomain,
      olcl: EnvConfig.oidc.client_id,
      timestamp: new Date().toISOString(),
      uptime: healthDetails.UptimeSeconds,
      database: healthDetails.Database,
      error: healthDetails.Error,
      ...systemInfo
    };

    return res.json(response);
  }

  // ------------------------
  // Generate Encrypted Client ID
  // ------------------------
  generateEncryptedClientId(req: Request, res: Response) {

    const clientId = EnvConfig.oidc.client_id;
    const clientSecret = EnvConfig.oidc.client_secret ?? Utils.generateRandomString(56);

    if (!clientId) {
      return res.status(400).json({
        error: "ClientId missing in configuration."
      });
    }

    try {

      const encryptedId = Utils.encryptString(clientId, clientSecret);

      return res.json({
        EncryptedClientId: encryptedId,
        X_Client_ID_Header: encryptedId,
        X_Client_Secret_Header: clientSecret
      });

    } catch (err: any) {

      return res.status(400).json({
        error: err.message ?? err
      });

    }
  }

  // ------------------------
  // Generate Decrypted Client ID
  // ------------------------
  generateDecryptedClientId(req: Request, res: Response) {

    const { ClientId, ClientSecret } = req.body;

    try {

      const decryptedId = Utils.decryptString(ClientId, ClientSecret);

      return res.json({
        ClientId: decryptedId,
        ClientSecret
      });

    } catch (err: any) {

      return res.status(400).json({
        error: `Invalid Key: ${err.message ?? err}`
      });

    }
  }

}
// import { Request, Response } from "express"
// import os from "os"
// import type { Sequelize } from "sequelize"
// import type { Logger, ILogObj } from "tslog"
// import { logger } from "@Infrastructure/Core/Logger.ts";

// import { BaseApiController } from "./BaseApiController.ts"
// import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
// import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";

// import { ConfigHelper } from "@/01-infrastructure/helpers/ConfigHelper.ts"
// import { getSystemInfo } from "@/01-infrastructure/helpers/SystemInfoHelper.ts"
// import { getDetailedHealth } from "@/01-infrastructure/services/healthService.ts"

// export class HomeController extends BaseApiController {
//   constructor(
//     logger: Logger<ILogObj>,
//     userRepo: IUserRepository
//   ) {
//     super(logger, userRepo)
//   }

//   /**
//    * GET /
//    */
//   async index(req: Request, res: Response) {
//     const systemInfo = getSystemInfo()
//     const allowedHosts = EnvConfig.BACKEND_CORS_ORIGINS.map(o =>
//       o.replace(/\/$/, "")
//     )

//     return this.success(res, {
//       appVersion: EnvConfig.APIVERSION,
//       allowedFEHost: allowedHosts,
//       ...systemInfo,
//     })
//   }

//   /**
//    * GET /health
//    */
//   async health(req: Request, res: Response, db: Sequelize) {
//     const environment = process.env.ENVIRONMENT || "Development"
//     const systemInfo = getSystemInfo()
//     const healthDetails = await getDetailedHealth(db)
//     return res.json({
//       status: healthDetails.IsHealthy ? "healthy" : "unhealthy",
//       environment,
//       appVersion: EnvConfig.APIVERSION,
//       sub: EnvConfig.OIDC.subdomain,
//       olcl: EnvConfig.OIDC.clientId,
//       timestamp: new Date().toISOString(),
//       uptime: healthDetails.UptimeSeconds,
//       database: healthDetails.Database,
//       error: healthDetails.Error,
//       ...systemInfo,
//     });

//     // return this.successBase(
//     //   res,
//     //   {
//     //     status: healthDetails.IsHealthy ? "healthy" : "unhealthy",
//     //     environment,
//     //     appVersion: EnvConfig.APIVERSION,
//     //     sub: EnvConfig.OIDC.subdomain,
//     //     olcl: EnvConfig.OIDC.clientId,
//     //     timestamp: new Date().toISOString(),
//     //     uptime: healthDetails.UptimeSeconds,
//     //     database: healthDetails.Database,
//     //     error: healthDetails.Error,
//     //     ...systemInfo,
//     //   },
//     //   req
//     // )
//   }

//   /**
//    * GET /generate-encrypted-client-id
//    */
//   generateEncryptedClientId(req: Request, res: Response) {
//     const { client_id, client_secret } = ConfigHelper.getAuthClientCredential()

//     if (!client_id) {
//       return res.status(400).json({ success: false, message: "ClientId missing in configuration." })
//     }

//     const secret = client_secret || ConfigHelper.generateRandomString(56)

//     try {
//       const encryptedClientId = ConfigHelper.encryptString(client_id, secret)
//       return res.json({
//         success: true,
//         EncryptedClientId: encryptedClientId,
//         X_Client_ID_Header: encryptedClientId,
//         X_Client_Secret_Header: secret,
//       })
//     } catch (err: any) {
//       return res.status(500).json({ success: false, message: err.message })
//     }
//   }

//   // generateEncryptedClientId(req: Request, res: Response) {
//   //   const acc = ConfigHelper.getAuthClientCredential()
//   //   let { client_id, client_secret } = acc

//   //   if (!client_id) {
//   //     return res.status(400).json({ message: "ClientId missing in configuration." })
//   //   }

//   //   if (!client_secret) {
//   //     client_secret = ConfigHelper.generateRandomString(56)
//   //   }

//   //   try {
//   //     const encryptedClientId = ConfigHelper.encryptString(client_id, client_secret)
//   //     return res.json({
//   //       EncryptedClientId: encryptedClientId,
//   //       X_Client_ID_Header: encryptedClientId,
//   //       X_Client_Secret_Header: client_secret,
//   //     })
//   //   } catch (err: any) {
//   //     return res.status(400).json({ message: err.message })
//   //   }
//   // }

//   /**
//    * GET /generate-decrypted-client-id
//    */
//   generateDecryptedClientId(req: Request, res: Response) {
//     const { ClientId, ClientSecret } = req.body

//     if (!ClientId || !ClientSecret) {
//       return res.status(400).json({
//         success: false,
//         message: "ClientId and ClientSecret are required",
//       })
//     }

//     try {
//       const decrypted = ConfigHelper.decryptString(ClientId, ClientSecret)
//       return res.json({
//         success: true,
//         ClientId: decrypted,
//         ClientSecret,
//       })
//     } catch (err: any) {
//       logger.error("Failed to decrypt ClientId", {
//         cipherSnippet: ClientId.slice(0, 20) + "...",
//         error: err.message,
//       })
//       return res.status(400).json({
//         success: false,
//         message: `Invalid Key or corrupted cipher: ${err.message}`,
//       })
//     }
//   }


// }
