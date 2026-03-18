// ===================================================================
// 🧩 src/04-Infrastructure/Auth/RequestUtils.ts
// ===================================================================
import { Request } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { GetLocalUser } from "@Infrastructure/Auth/LocalAuth.ts";
import { GetOLUser, OLIssuer } from "@Infrastructure/Auth/OLAuth.ts";

export function getBearerToken(req: Request): string | null {
  const token = req.query.token as string | undefined;
  if (token) {
    return token.trim(); // query param token is raw, no Bearer prefix
  }

  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;

  if (!authHeader.startsWith("Bearer ")) return null;

  return authHeader.substring("Bearer ".length).trim();
}

export function getFullToken(req: Request): string {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header");
  }
  return authHeader.split(" ")[1];
}

export async function getActiveUser(req: Request): Promise<any | null> {
  const token = getBearerToken(req);
  if (!token) return null;

  let payload: JwtPayload;
  try {
    // decode without verifying signature
    payload = jwt.decode(token) as JwtPayload;
    if (!payload) return null;
  } catch {
    return null;
  }

  const issuer = payload.iss;
  const localIssuer = `${req.protocol}://${req.get("host")}`;

  if (issuer === localIssuer) {
    return await GetLocalUser(token);
  } else if (issuer === OLIssuer) {
    return await GetOLUser(token);
  } else {
    return null;
  }
}
