// api-node/src/api/controllers/BaseApiController.ts

import { Request, Response, NextFunction } from "express"
// import type { Logger, ILogObj } from "tslog"
import { logger } from "@Infrastructure/Core/Logger.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
import type { UserFlatBase } from "01-Contracts/Base/Users/UserSchemas.ts"

import { getActiveUser } from "@Infrastructure/Auth/RequestUtils.ts"



export class BaseApiController {
  // protected readonly logger: Logger<ILogObj>
  protected readonly userRepo: IUserRepository
  protected _request?: Request

  constructor(
    // logger: logger,
    userRepo: IUserRepository
  ) {
    // this.logger = logger
    this.userRepo = userRepo
  }

  // ----------------------------
  // Authentication Methods
  // ----------------------------
  async getCurrentUser(req: Request): Promise<UserFlatBase | null> {
    try {
      return await getActiveUser(req)
    } catch (err) {
      return null
    }
  }

  async requireCurrentUser(req: Request): Promise<UserFlatBase> {
    const user = await this.getCurrentUser(req)
    if (!user) {
      throw new Error("Unauthorized")
    }
    return user
  }

  // ----------------------------
  // Success Responses
  // ----------------------------
  success(res: Response, data: unknown, message?: string) {
    this._logSuccess("API success response")
    return res.status(200).json({
      success: true,
      message: message ?? "",
      data,
    })
  }

  successBase(res: Response, data: unknown, req: unknown) {
    this._logSuccess("API successBase response")
    return res.status(200).json({
      success: true,
      data,
      path: this._request?.originalUrl,
    })
  }

  // ----------------------------
  // Error Responses
  // ----------------------------
  error(res: Response, message: string, statusCode = 400) {
    logger.warn(`API error: ${message}`)
    return res.status(statusCode).json({
      success: false,
      message: message,
    })
  }

  internalError(res: Response, message: string, ex?: unknown) {
    logger.error(`Internal server error: ${message}`, ex)
    return res.status(500).json({
      success: false,
      error: "An unexpected error occurred.",
    })
  }

  // ----------------------------
  // Private Logging Helper
  // ----------------------------
  private _logSuccess(message: string) {
    if (!this._request) {
      logger.info(message)
      return
    }

    const clientIp =
      this._request.ip || this._request.socket.remoteAddress

    const frontendPort = this._request.headers["x-frontend-port"]

    logger.info(message, {
      ip: clientIp,
      frontend_port: frontendPort,
      path: this._request.originalUrl,
      method: this._request.method,
    })
  }

  protected requireUserMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const currentUser = await this.requireCurrentUser(req)
        if (!currentUser) {
          return res.status(401).json({ success: false, message: "Unauthorized" })
        }

        // Attach user for downstream handlers
        (req as any).user = currentUser
        next()
      } catch (err) {
        return res.status(500).json({ success: false, message: "Server error" })
      }
    }
  }  
}
