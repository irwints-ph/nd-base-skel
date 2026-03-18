// ===================================================================
// 🧩 src/04-Infrastructure/Auth/OLAuth.ts
// ===================================================================
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { UserRepository } from "@Infrastructure/Persistence/Repositories/Base/UserRepository.ts";
import { GetDbAsync } from "@Infrastructure/Persistence/Dependencies/db.ts";
import { AuthenticateOLUserUseCase } from "@Application/UseCases/Auth/AuthenticateOLUserUseCase.ts";
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

    const db = await GetDbAsync();
    const userRepo = new UserRepository();
    const usecase = new AuthenticateOLUserUseCase(() => userRepo);

    const result = await usecase.execute(token, ssokey);

    if (result) {
      await db.commit();
      return result;
    }

    throw new Error("Could not validate credentials");
  } catch (err) {
    throw new Error("Could not validate credentials");
  }
}
