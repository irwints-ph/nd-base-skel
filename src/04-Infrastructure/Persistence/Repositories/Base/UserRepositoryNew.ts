// ===================================================================
// 🧩 App/Infrastructure/Persistence/Repositories/Base/UserRepository.ts
// ===================================================================

import { Transaction } from "sequelize";
import { sequelize } from "../../AppDBContext.ts";

import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
import ContactMstr from "@Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import SsoKey from "@Infrastructure/Persistence/Models/Base/SsoKey.ts";

import { ContactTypes } from "@Infrastructure/Persistence/Models/Constants/ContactTypes.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";

import UserMapper from "@Infrastructure/Persistence/Mappers/Base/UserMapper.ts";
import { User } from "@Domain/Entities/Base/User/User.ts";
import { UserUpdateSchema } from "@Contracts/Base/Users/UserSchemas.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";

export class UserRepository implements IUserRepository {

  // =========================================================
  // 🔹 ADD USER (cleaned)
  // =========================================================
  async add(domainUser: User, transaction?: Transaction): Promise<UserMstr> {

    const ormUser = UserMapper.toOrm(domainUser);

    // 🔥 IMPORTANT: persist root first only
    await ormUser.save({ transaction });

    // 🔁 Fix CreatedBy self-reference (only if needed)
    if (ormUser.CreatedBy === -1) {
      ormUser.CreatedBy = ormUser.UserId;
      await ormUser.save({ transaction });
    }

    return ormUser;
  }

  // =========================================================
  // 🔹 UPDATE USER
  // =========================================================
  async updateUser(
    userData: UserUpdateSchema,
    updatedBy: number,
    tx?: Transaction
  ): Promise<UserMstr | null> {

    const ormUser = await UserMstr.findByPk(userData.userId, {
      include: [
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: tx,
    });

    if (!ormUser) return null;

    const domainUser = UserMapper.toDomain(ormUser);
    domainUser.updateFromDto(userData, updatedBy);

    // 🔥 Mapper handles full sync (NO manual loops here)
    await UserMapper.updateOrmFromDomain(ormUser, domainUser);

    await ormUser.save({ transaction: tx });

    return ormUser;
  }

  // =========================================================
  // 🔹 DELETE USER
  // =========================================================
  async delete(
    ormUserInput: UserMstr,
    tx?: Transaction
  ): Promise<UserMstr | void> {

    const ormUser = await UserMstr.findByPk(ormUserInput.UserId, {
      include: [
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: tx,
    });

    if (!ormUser) return;

    // 🔥 Let DB cascade OR model hooks handle child deletion if configured
    if (ormUser.Profile) await ormUser.Profile.destroy({ transaction: tx });
    if (ormUser.Sso) await ormUser.Sso.destroy({ transaction: tx });

    // ⚠️ Contacts now independent — still safe to delete if needed
    if (ormUser.Contacts?.length) {
      for (const c of ormUser.Contacts) {
        await c.destroy({ transaction: tx });
      }
    }

    await ormUser.destroy({ transaction: tx });

    return ormUser;
  }

  // =========================================================
  // 🔹 GET BY ID ORM
  // =========================================================
  async getByIdOrm(userId: number, tx?: Transaction): Promise<UserMstr | null> {

    return UserMstr.findByPk(userId, {
      include: [
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: tx,
    });
  }

  // =========================================================
  // 🔹 GET BY ID (DOMAIN)
  // =========================================================
  async getById(userId: number, tx?: Transaction): Promise<User | null> {

    const ormUser = await this.getByIdOrm(userId, tx);

    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  // =========================================================
  // 🔹 GET BY USERNAME
  // =========================================================
  async getByUsername(username: string, tx?: Transaction): Promise<User | null> {

    if (!username) return null;

    const ormUser = await UserMstr.findOne({
      where: { Username: username },
      include: [
        { association: "Profile" },
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso" }
      ],
      transaction: tx,
    });

    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  // =========================================================
  // 🔹 GET BY EMAIL ORM (FIXED JOIN SAFETY)
  // =========================================================
  async getByEmailOrm(email: string, tx?: Transaction): Promise<UserMstr | null> {

    return UserMstr.findOne({
      include: [
        {
          model: ContactMstr,
          as: "Contacts",
          required: true, // 🔥 ensures email match is enforced correctly
          where: {
            ContactTypeId: ContactTypes.Email,
            ContactValue: sequelize.where(
              sequelize.fn(
                "lower",
                sequelize.col(DatabaseNamingConvention.getName("ContactValue"))
              ),
              email.toLowerCase()
            )
          }
        },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: tx,
    });
  }

  // =========================================================
  // 🔹 GET BY EMAIL DOMAIN
  // =========================================================
  async getByEmail(email: string, tx?: Transaction): Promise<User | null> {

    const ormUser = await this.getByEmailOrm(email, tx);

    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  // =========================================================
  // 🔹 GET BY SSO
  // =========================================================
  async getBySsoId(
    ssoKey: string,
    ssoType: number,
    tx?: Transaction
  ): Promise<User | null> {

    const ormUser = await UserMstr.findOne({
      include: [
        { model: ContactMstr, as: "Contacts" },
        {
          model: SsoKey,
          as: "Sso",
          where: {
            SsoId: ssoKey,
            TypeId: ssoType
          }
        },
        { association: "Profile" }
      ],
      transaction: tx,
    });

    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  // =========================================================
  // 🔹 ADD SSO
  // =========================================================
  async addSso(
    ormUser: UserMstr,
    ssoId: string,
    typeId: number,
    createdBy: number,
    tx?: Transaction
  ): Promise<UserMstr> {

    const domainUser = UserMapper.toDomain(ormUser);

    domainUser.addSso(ssoId, typeId, createdBy);

    await UserMapper.updateOrmFromDomain(ormUser, domainUser);

    await ormUser.save({ transaction: tx });

    return ormUser;
  }

  // =========================================================
  // 🔹 SAVE USER (cleaned)
  // =========================================================
  async save(domainUser: User, tx?: Transaction): Promise<UserMstr | void> {

    const ormUser = await UserMstr.findByPk(domainUser.id, {
      include: [
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: tx,
    });

    if (!ormUser) return;

    await UserMapper.updateOrmFromDomain(ormUser, domainUser);

    await ormUser.save({ transaction: tx });

    return ormUser;
  }
}