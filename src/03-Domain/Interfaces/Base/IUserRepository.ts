// ===================================================================
// 🧩 src/03-Domain/Interfaces/Base/IUserRepository.ts
// ===================================================================

import { UserMstr } from "#Infrastructure/Persistence/Models/Base/index.ts";
import { User } from "#Domain/Entities/Base/User/User.ts";
import { Transaction } from "sequelize";

export interface IUserRepository {
  // ==============================================================
  // 🟢 WRITE
  // ==============================================================

  create(user: User, tx?: Transaction): Promise<User>;

  save(user: User, tx?: Transaction): Promise<void>;

  updateUser(
    userData: any,
    updatedBy: number,
    tx?: Transaction,
  ): Promise<any | null>;

  delete(user: User, tx?: Transaction): Promise<void>;

  changePassword(
    userId: number,
    newHash: string,
    tx?: Transaction,
  ): Promise<void>;

  // ==============================================================
  // 🔵 READ
  // ==============================================================

  getById(userId: number, tx?: Transaction): Promise<User | null>;

  getByEmail(email: string, tx?: Transaction): Promise<User | null>;
  getByEmailOrm(email: string, tx?: Transaction): Promise<UserMstr | null>;

  getByUsername(username: string, tx?: Transaction): Promise<User | null>;

  getBySsoId(
    ssoKey: string,
    ssoType: number,
    tx?: Transaction,
  ): Promise<User | null>;
}