// ===================================================================
// 🟢 App/Api/Controllers/HomeController.ts
// ===================================================================

import { Request, Response } from "express";
import os from "os";

import { BaseApiController } from "./BaseApiController.ts"
// import { logger } from "#Infrastructure/Core/Logger.ts";
import { EnvConfig } from "#Infrastructure/Core/ConfigLoader.ts";
import { sequelize } from "#Infrastructure/Persistence/AppDBContext.ts";
import { Utils } from "#Infrastructure/Helpers/Utils.ts";
import { getSystemInfo } from "#Infrastructure/Helpers/SystemInfoHelper.ts";
import { GetHealthUseCase } from "#Application/Services/HealthService.ts";
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
