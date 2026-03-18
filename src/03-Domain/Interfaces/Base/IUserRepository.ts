// ===================================================================
// 🧩 src/03-Domain/Interfaces/Base/IUserRepository.ts
// ===================================================================
import { User } from "@Domain/Entities/Base/User/User.ts";
import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
import { Transaction } from "sequelize";

export interface IUserRepository {
  session?: Transaction;
  add(user: User): Promise<UserMstr>;
  delete(user: UserMstr): Promise<UserMstr | void>;
  getById(userId: number): Promise<User | null>;
  getByIdOrm(userId: number): Promise<UserMstr | null>;
  getByEmail(email: string): Promise<User | null>;
  getByEmailOrm(email: string): Promise<UserMstr | null>;
  getByUsername(username: string): Promise<User | null>;
  getBySsoId(ssoKey: string, ssoType: number): Promise<User | null>;
  // getBySsoIdOrm(ssoKey: string, ssoType: number): Promise<UserMstr | null>;
  addSso(
    ormUser: UserMstr,
    ssoId: string,
    typeId: number,
    createdBy: number,
    tx?: Transaction
  ): Promise<UserMstr | null>;
  save(user: User): Promise<UserMstr | void>;
}
