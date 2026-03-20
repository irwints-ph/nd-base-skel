// ===================================================================
// 🧩 App/Infrastructure/Persistence/Repositories/Base/UserRepository.ts
// ===================================================================
import { Op, Transaction } from "sequelize";
import { sequelize } from "../../AppDBContext.ts";

import UserMstr  from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
import ContactMstr  from "@Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import SsoKey  from "@Infrastructure/Persistence/Models/Base/SsoKey.ts";
import { ContactTypes } from "@Infrastructure/Persistence/Models/Constants/ContactTypes.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";

import UserMapper from "@Infrastructure/Persistence/Mappers/Base/UserMapper.ts";
import { User } from "@Domain/Entities/Base/User/User.ts";
import { UserUpdateSchema } from "@Contracts/Base/Users/UserSchemas.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";

export class UserRepository implements IUserRepository {
  public session?: Transaction;
  // -------------------------------------------------------------------
  // 🔹 ADD USER
  // -------------------------------------------------------------------
  async add(domainUser: User): Promise<UserMstr> {
    const ormUser = UserMapper.toOrm(domainUser);
    // const Oldvalue = UserMapper.updateOrmFromDomain(ormUser, domainUser);
    if (ormUser.Profile) ormUser.Profile.UserId = ormUser.UserId;
    if (ormUser.Contacts) ormUser.Contacts.forEach(c => (c.UserId = ormUser.UserId));
    if (ormUser.Sso) ormUser.Sso.UserId = ormUser.UserId;
    await ormUser.save({ transaction: this.session });

    // Now UserId is generated - Mimic Trigger
    if (ormUser.CreatedBy === -1) {
      ormUser.CreatedBy = ormUser.UserId;
      await ormUser.save({ transaction: this.session }); // update with correct CreatedBy
    }    
    if (ormUser.Profile) {
      ormUser.Profile.UserId = ormUser.UserId;
      ormUser.Profile.CreatedBy = ormUser.CreatedBy;
      await ormUser.Profile.save({ transaction: this.session });
    }

    if (ormUser.Contacts) {
      for (const c of ormUser.Contacts) {
        c.UserId = ormUser.UserId;
        c.CreatedBy = ormUser.CreatedBy;
        await c.save({ transaction: this.session });
      }
    }

    if (ormUser.Sso) {
      ormUser.Sso.UserId = ormUser.UserId;
      ormUser.Sso.CreatedBy = ormUser.CreatedBy;
      await ormUser.Sso.save({ transaction: this.session });
    }

    return ormUser;
    // return domainUser.withId(ormUser.UserId);
  }

  // -------------------------------------------------------------------
  // 🔹 UPDATE USER
  // -------------------------------------------------------------------
  async updateUser(userData: UserUpdateSchema, updatedBy: number): Promise<UserMstr | null> {
    const ormUser = await UserMstr.findByPk(userData.userId, {
      include: [
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: this.session
    });

    if (!ormUser) return null;

    const domainUser = UserMapper.toDomain(ormUser);
    domainUser.updateFromDto(userData, updatedBy);

    await UserMapper.updateOrmFromDomain(ormUser, domainUser);
    await ormUser.save({ transaction: this.session });

    return ormUser;
  }
  // -------------------------------------------------------------------
  // 🔹 DELETE USER (with Profile, Contacts, SSO audited)
  // -------------------------------------------------------------------
  async delete(OrmUser: UserMstr): Promise<UserMstr | void> {
    const ormUser = await UserMstr.findByPk(OrmUser.UserId, {
      include: [
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: this.session
    });

    if (!ormUser) return;
    // Destroy ormUser should be enough to delete all due to cascade
    // Delete one at a time for auditing, 
    // 🔹 Destroy related entities first so hooks fire
    if (ormUser.Profile) {
      await ormUser.Profile.destroy({ transaction: this.session });
    }

    if (ormUser.Contacts) {
      for (const c of ormUser.Contacts) {
        await c.destroy({ transaction: this.session });
      }
    }

    if (ormUser.Sso) {
      await ormUser.Sso.destroy({ transaction: this.session });
    }

    // 🔹 Finally destroy the user itself
    await ormUser.destroy({ transaction: this.session });

    return ormUser;
  }

  // -------------------------------------------------------------------
  // 🔹 GET BY ID
  // -------------------------------------------------------------------
  async getByIdOrm(userId: number): Promise<UserMstr | null> {
    return UserMstr.findByPk(userId, {
      include: [
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: this.session,
    });
  }
  async getById(userId: number): Promise<User | null> {
    const ormUser = await UserMstr.findByPk(userId, {
      include: [{ association: "Profile" }, { model: ContactMstr, as: "Contacts" }, { model: SsoKey, as: "Sso" }],
      transaction: this.session,
    });
    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  // -------------------------------------------------------------------
  // 🔹 GET BY USERNAME
  // -------------------------------------------------------------------
  async getByUsername(username: string): Promise<User | null> {
    // console.log(UserMstr.associations);
    if(username){
      const ormUser = await UserMstr.findOne({
        where: { Username: username },
        include: [{ association: "Profile" }, { model: ContactMstr, as: "Contacts" }, { model: SsoKey, as: "Sso" }],
        transaction: this.session,
      });
      return ormUser ? UserMapper.toDomain(ormUser) : null;
    }
    return null;
  }

  // -------------------------------------------------------------------
  // 🔹 GET BY EMAIL
  // -------------------------------------------------------------------
  async getByEmailOrm(email: string): Promise<UserMstr | null> {
    const ormUser = await UserMstr.findOne({
      include: [
        {
          model: ContactMstr,
          as: "Contacts",
          where: {
            ContactTypeId: ContactTypes.Email,
            ContactValue: sequelize.where(
              sequelize.fn("lower", sequelize.col(DatabaseNamingConvention.getName("ContactValue"))),
              email.toLowerCase()
            )
          }
        },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: this.session,
    });
    return ormUser;
  }

  async getByEmail(email: string): Promise<User | null> {
    const ormUser = await this.getByEmailOrm(email);
    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  // -------------------------------------------------------------------
  // 🔹 GET BY SSO
  // -------------------------------------------------------------------
  async getBySsoId(
    ssoKey: string,
    ssoType: number
  ): Promise<User | null> {
    const ormUser = await UserMstr.findOne({
      include: [
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso", where: { SsoId: ssoKey, TypeId: ssoType } },
        { association: "Profile" }
      ],
      transaction: this.session,
    });

    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  // -------------------------------------------------------------------
  // 🔹 ADD SSO TO EXISTING USER
  // -------------------------------------------------------------------
  async addSso(
    ormUser: UserMstr,
    ssoId: string,
    typeId: number,
    createdBy: number
  ): Promise<UserMstr> {
    const domainUser = UserMapper.toDomain(ormUser);
    domainUser.addSso(ssoId, typeId, createdBy);
    await UserMapper.updateOrmFromDomain(ormUser, domainUser);
    await ormUser.save({ transaction: this.session });
    return ormUser;
  }

  // -------------------------------------------------------------------
  // 🔹 SAVE DOMAIN USER TO ORM - For existing users
  // -------------------------------------------------------------------
  async save(domainUser: User): Promise<UserMstr | void> {
    const ormUser = await UserMstr.findByPk(domainUser.id, {
      include: [
        { model: ContactMstr, as: "Contacts" },
        { model: SsoKey, as: "Sso" },
        { association: "Profile" }
      ],
      transaction: this.session,
    });
    if (!ormUser) return;
    const Oldvalue = UserMapper.updateOrmFromDomain(ormUser, domainUser);
    await ormUser.save({ transaction: this.session });
    if (ormUser.Profile) {
      ormUser.Profile.UserId = ormUser.UserId;
      await ormUser.Profile.save({ transaction: this.session });
    }

    if (ormUser.Contacts) {
      for (const c of ormUser.Contacts) {
        c.UserId = ormUser.UserId;
        await c.save({ transaction: this.session });
      }
    }

    if (ormUser.Sso) {
      ormUser.Sso.UserId = ormUser.UserId;
      await ormUser.Sso.save({ transaction: this.session });
    }

    return ormUser;
  }
}