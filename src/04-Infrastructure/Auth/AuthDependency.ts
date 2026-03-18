// src/infrastructure/auth/AuthDependency.ts
import { Request, Response, NextFunction } from "express"
import { UnauthorizedError } from "./errors/UnauthorizedError.ts"
import { ConfigHelper, AuthClientCredential } from "../helpers/ConfigHelper.ts"

/**
 * Middleware to validate X-Client-ID / X-Client-Secret headers
 * Throws 401 if missing/invalid
 */
export function AppSettingPolicy(req: Request, res: Response, next: NextFunction) {
  const xClientId = req.header("X-Client-ID")
  const xClientSecret = req.header("X-Client-Secret")
  // console.log(`AppSettingPolicy: X-Client-ID=${xClientId}, X-Client-Secret=${xClientSecret}`);

  if (!xClientId || !xClientSecret) {
    throw new UnauthorizedError("Missing X-Client-ID or X-Client-Secret")
  }

  const accCredentials: AuthClientCredential = ConfigHelper.getAuthClientCredential()
  const expectedClientId = accCredentials.client_id
  // console.log(`AppSettingPolicy: accCredentials=${accCredentials.client_id}, expectedClientId=${expectedClientId}`);

  if (!expectedClientId) {
    // If the application is running without configured client credentials
    // (e.g. local development), skip the AppSettingPolicy instead of
    // throwing an exception so the server can start and routes can be
    // exercised without the header check.
    // NOTE: In production, ensure ConfigHelper returns proper credentials.
    // eslint-disable-next-line no-console
    console.warn('AppSettingPolicy: no configured client_id found, skipping header check')
    return next()
  }

  try {
    const decryptedClientId = ConfigHelper.decryptString(xClientId, xClientSecret)

    if (decryptedClientId !== expectedClientId) {
      throw new UnauthorizedError("Invalid client credentials")
    }

    // attach to request for later use
    (req as any).client = { client_id: decryptedClientId }
    next() // pass control to next middleware or route

  } catch (err: any) {
    throw new UnauthorizedError(`Decryption failed: ${err?.message ?? err}`)
  }
}
