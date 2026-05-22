// ===================================================================
// 🧩 src/04-Infrastructure/Auth/LocalAuth.ts
// ===================================================================
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { EnvConfig } from "#Infrastructure/Core/ConfigLoader.ts";
import { UserRepository } from "#Infrastructure/Persistence/Repositories/Base/UserRepository.ts";
import { UserDtoMapper } from "#Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
// import getDbAsync  from "#Infrastructure/Persistence/Dependencies/db.ts";
import { GetDbAsync } from "#Infrastructure/Persistence/Dependencies/db.ts";
import { User } from "03-Domain/Entities/Base/User/User.ts";

const SECRET_KEY = EnvConfig.jwt.JWT_SECRET_KEY;
const ALGORITHM = EnvConfig.jwt.JWT_ALGORITHMS  as jwt.Algorithm;

export async function GetLocalUser(token: string) {
  try {
    const payload = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM] }) as JwtPayload;
    // console.log("userId",payload.sub);
    const userId = payload.sub;
    if (!userId) {
      throw new Error(`Could not validate credentials ${payload.sub}`);
    }
    console.log("called GetDbAsync LocalAuth.ts");
    const db = await GetDbAsync();
    const userRepo = new UserRepository();

    const userDomain:User | null = await userRepo.getById(Number(userId), db);
    if (!userDomain) {
      throw new Error("User not found");
    }
    return UserDtoMapper.toDomainUserFlatBase(userDomain);
  } catch (err) {
    throw new Error(`Could not validate credentials ${err}`);
  }
}

// Express middleware example
export async function requireLocalUser(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const user = await GetLocalUser(token);
    (req as any).user = user; // attach to request
    next();
  } catch {
    return res.status(401).json({ message: "Could not validate credentials" });
  }
}
