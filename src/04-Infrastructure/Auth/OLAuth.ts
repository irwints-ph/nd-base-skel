// ===================================================================
// 🧩 src/04-Infrastructure/Auth/OLAuth.ts
// ===================================================================
import { EnvConfig } from "#Infrastructure/Core/ConfigLoader.ts";
import { AuthenticateOLUserUseCase } from "#Application/UseCases/Auth/AuthenticateOLUserUseCase.ts";
import jwt, { JwtPayload } from "jsonwebtoken";

export const OLIssuer = EnvConfig.oidc.authority;
export const OLPortal = `${EnvConfig.oidc.base_uri}/portal`;

export async function GetOLUser(token: string) {
  try {
    // Verify token against OneLogin issuer
    const payload = jwt.decode(token) as JwtPayload;
    if (!payload || payload.iss !== OLIssuer) {
      throw new Error("Could not validate credentials");
    }

    const ssokey = payload.sub;
    if (!ssokey) {
      throw new Error("Could not validate credentials");
    }

    const usecase = new AuthenticateOLUserUseCase();

    const result = await usecase.execute(token, ssokey);

    if (result) {
      return result;
    }

    throw new Error("Could not validate credentials");
  } catch (err) {
    throw new Error("Could not validate credentials");
  }
}
