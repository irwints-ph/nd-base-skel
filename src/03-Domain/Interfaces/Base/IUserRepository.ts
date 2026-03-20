// ===================================================================
// 🧩 src/03-Domain/Interfaces/Base/IUserRepository.ts
// ===================================================================
import { User } from "@Domain/Entities/Base/User/User.ts";
import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
import { Transaction } from "sequelize";

export interface IUserRepository {
  // session?: Transaction;
  add(user: User, tx:Transaction): Promise<UserMstr>;
  delete(user: UserMstr, tx:Transaction): Promise<UserMstr | void>;
  getById(userId: number, tx:Transaction): Promise<User | null>;
  getByIdOrm(userId: number, tx:Transaction): Promise<UserMstr | null>;
  getByEmail(email: string, tx:Transaction): Promise<User | null>;
  getByEmailOrm(email: string, tx:Transaction): Promise<UserMstr | null>;
  getByUsername(username: string, tx:Transaction): Promise<User | null>;
  getBySsoId(ssoKey: string, ssoType: number, tx:Transaction): Promise<User | null>;
  // getBySsoIdOrm(ssoKey: string, ssoType: number): Promise<UserMstr | null>;
  addSso(
    ormUser: UserMstr,
    ssoId: string,
    typeId: number,
    createdBy: number,
    tx?: Transaction
  ): Promise<UserMstr | null>;
  save(user: User, tx:Transaction): Promise<UserMstr | void>;
}
