// src/infrastructure/auth/JwtAuthService.ts
// File: JwtAuthService.ts
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "#Domain/Entities/Base/User/User.ts";
import { UserFlatBase } from "#Contracts/Base/Users/UserSchemas.ts";
import { UserRepository } from "#Infrastructure/Persistence/Repositories/Base/UserRepository.ts";
import { UserDtoMapper } from "#Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts";
import { AppTime } from "#Infrastructure/Core/AppTime.ts";
import { BcryptPasswordHasher } from "#Infrastructure/Auth/BcryptPasswordHasher.ts";
import { Transaction } from "sequelize";
// import { AsyncSession } from "#Infrastructure/Persistence/Dependencies/db.ts";

const passwordHasher = new BcryptPasswordHasher();

export const ACCESS_TOKEN_EXPIRE_MINUTES = 60; // adjust or import
export const SECRET_KEY = process.env.JWT_SECRET_KEY || "secret";
export const ALGORITHM: jwt.Algorithm = "HS256";

// --------------------------------------
// Authentication Functions
// --------------------------------------
export async function authenticateUser(
  username: string,
  password: string,
  tx?: Transaction
  // db: AsyncSession
): Promise<UserFlatBase | null> {
  const userRepo = new UserRepository();

  // Fetch domain user
  const userDomain: User | null = await userRepo.getByUsername(username,tx);
  if (!userDomain) return null;

  // Validate password
  if (!passwordHasher.verify(password, userDomain.password_hash)) return null;

  // Check active status
  if (!userDomain.isActive) return null;

  // Map to DTO for API
  return UserDtoMapper.toDomainUserFlatBase(userDomain);
}

// --------------------------------------
// Access token creation
// --------------------------------------
export function createAccessToken(userData: UserFlatBase, issuer: string): string {
  const expire = AppTime.appNow().getTime() / 1000 + ACCESS_TOKEN_EXPIRE_MINUTES * 60;

  const payload = {
    sub: String(userData.userId),
    email: userData.email,
    name: userData.fullname,
    iss: issuer,
    exp: expire
  };

  return jwt.sign(payload, SECRET_KEY, { algorithm: ALGORITHM });
}

// --------------------------------------
// Bearer token extraction (optional)
// --------------------------------------
export function getBearerToken(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}