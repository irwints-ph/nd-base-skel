// src/Infrastructure/Auth/BcryptPasswordHasher.ts
import bcrypt from "bcrypt";
import { IPasswordHasher } from "#Application/Security/IPasswordHasher.ts";

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds = 12) {
    this.saltRounds = saltRounds;
  }

  /**
   * Hash a plaintext password
   */
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  }

  /**
   * Verify a plaintext password against a hash
   */
  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
