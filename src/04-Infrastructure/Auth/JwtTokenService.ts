// ===================================================================
// 🟢 App/Infrastructure/Auth/JwtTokenService.ts
// ===================================================================
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "@Domain/Entities/Base/User/User.ts";
import { UserActivationResponse, UserFlatBase } from "@Contracts/Base/Users/UserSchemas.ts";
import { EnvConfig } from "@Infrastructure/Core/ConfigLoader.ts";
import { AppTime } from "@Infrastructure/Core/AppTime.ts";
import { logger } from "@Infrastructure/Core/Logger.ts";

export enum TokenPurpose {
  Activate = "activate",
  Forgot = "forgot",
  RequestAccess = "requestaccess",
}

export enum TokenUserType {
  General = "general",
  Admin = "admin",
}

const TOKEN_ID_CLAIM = "typeId";

export class JwtTokenService {
  private static config() {
    return EnvConfig.jwt;
  }

  // -----------------------------
  // CREATE VERIFICATION TOKEN
  // -----------------------------
  static createVerificationToken(
    email: string,
    verifyOnly = false,
    tokenPurpose: TokenPurpose = TokenPurpose.Activate,
    userId?: string,
    userType: TokenUserType = TokenUserType.General,
    expiresAt?: Date
  ): { token: string; expires: Date } {
    const cfg = this.config();
    const expiry = expiresAt ?? new Date(AppTime.appNow().getTime() + cfg.JWT_TIME_OUT * 60_000);

    const payload: any = {
      sub: email,
      verifyOnly: String(verifyOnly).toLowerCase(),
      [TOKEN_ID_CLAIM]: tokenPurpose.toLowerCase(),
      exp: Math.floor(expiry.getTime() / 1000),
      iss: cfg.JWT_ISSUER,
    };

    if (userId) payload.userId = userId;
    if (userType) payload.userType = userType.toLowerCase();

    const token = jwt.sign(payload, cfg.JWT_SECRET_KEY, { algorithm: cfg.JWT_ALGORITHMS as jwt.Algorithm });
    return { token, expires: expiry };
  }

  // -----------------------------
  // VERIFY TOKEN
  // -----------------------------
  static verifyToken(token: string, expectedPurpose: TokenPurpose = TokenPurpose.Activate): UserActivationResponse | null {
    try {
      const cfg = this.config();
      const decoded = jwt.verify(token, cfg.JWT_SECRET_KEY, {
        algorithms: [cfg.JWT_ALGORITHMS as jwt.Algorithm],
      }) as JwtPayload;

      const tokenType = decoded[TOKEN_ID_CLAIM];
      if (tokenType !== expectedPurpose.toLowerCase()) return null;

      const email = decoded.sub as string;
      const verifyOnly = (decoded.verifyOnly as string)?.toLowerCase() === "true";

      // return new UserActivationResponse({ email, verifyOnly });
      // ✅ Return a plain object matching the interface
      return { email, verifyOnly };      
    } catch (err: any) {
      logger.error(`Error verifying token: ${err.message ?? err}`);
      return null;
    }
  }

  // -----------------------------
  // CONVENIENCE METHODS
  // -----------------------------
  static createForgotPasswordToken(email: string, verifyOnly = false): string {
    return this.createVerificationToken(email, verifyOnly, TokenPurpose.Forgot).token;
  }

  static generateAccessToken(userId: number, username: string): string {
    const cfg = this.config();
    const expire = new Date(AppTime.appNow().getTime() + cfg.JWT_TIME_OUT * 60_000);

    const payload = {
      sub: String(userId),
      name: username,
      exp: Math.floor(expire.getTime() / 1000),
    };

    return jwt.sign(payload, cfg.JWT_SECRET_KEY, { algorithm: cfg.JWT_ALGORITHMS as jwt.Algorithm});
  }

  static createAccessTokenOtp(userData: User, issuer: string): string {
    const expire = new Date(AppTime.appNow().getTime() + EnvConfig.jwt.JWT_TIME_OUT * 60_000);

    const payload = {
      sub: String(userData.id),
      email: userData.contacts.find(c => c.IsPrimary)?.ContactValue ?? null,
      name: userData.profile?.Firstname + " " + userData.profile?.Lastname,
      iss: issuer,
      exp: Math.floor(expire.getTime() / 1000),
    };

    return jwt.sign(payload, EnvConfig.jwt.JWT_SECRET_KEY, { algorithm: EnvConfig.jwt.JWT_ALGORITHMS as jwt.Algorithm});
  }

  static createAccessToken(userData: UserFlatBase, issuer: string): string {
    const expire = new Date(AppTime.appNow().getTime() + EnvConfig.jwt.JWT_TIME_OUT * 60_000);

    const payload = {
      sub: String(userData.userId),
      email: userData.email,
      name: userData.fullname,
      iss: issuer,
      exp: Math.floor(expire.getTime() / 1000),
    };

    return jwt.sign(payload, EnvConfig.jwt.JWT_SECRET_KEY, { algorithm: EnvConfig.jwt.JWT_ALGORITHMS as jwt.Algorithm});
  }
}