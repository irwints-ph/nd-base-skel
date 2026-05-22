// ===================================================================
// 🧩 UserRepository.ts (Python-equivalent architecture)
// ===================================================================
import { col, fn, Op, where, Transaction, Sequelize } from "sequelize";
import UserMstr from "#Infrastructure/Persistence/Models/Base/UserMstr.ts";
import ContactMstr from "#Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import SsoKey from "#Infrastructure/Persistence/Models/Base/SsoKey.ts";
import { ContactTypes } from "#Infrastructure/Persistence/Models/Constants/ContactTypes.ts";
import { IUserRepository } from "#Domain/Interfaces/Base/IUserRepository.ts";
import { User } from "#Domain/Entities/Base/User/User.ts";
import { UserUpdateSchema } from "#Contracts/Base/Users/UserSchemas.ts";
import UserMapper from "#Infrastructure/Persistence/Mappers/Base/UserMapper.ts";
import { sequelize } from "../../AppDBContext.ts";

// ================================================================
// 🔁 shared include (like SQLAlchemy joinedload/selectinload)
// ================================================================
const USER_INCLUDE = [
  { association: "Profile" },
  { model: ContactMstr, as: "Contacts" },
  { model: SsoKey, as: "Sso" },
];

export class UserRepository implements IUserRepository {
  // ==============================================================
  // 🟢 CREATE USER (Python: create)
  // ==============================================================
  async create(domainUser: User, tx?: Transaction): Promise<User> {
    domainUser.changePassword(domainUser.password_hash);

    const ormUser = UserMapper.toOrm(domainUser);

    await ormUser.save({ transaction: tx });

    // refresh generated ID
    const userId = ormUser.UserId;
    if (ormUser.Profile) ormUser.Profile.UserId = userId;
    if (ormUser.Sso) ormUser.Sso.UserId = userId;
    if (ormUser.Contacts?.length) {
      for (const c of ormUser.Contacts) {
        c.UserId = userId;
      }
    }

    await this.saveRelations(ormUser, tx);
    domainUser.id = userId;
    return domainUser;
  }

  // ==============================================================
  // 🟡 UPDATE USER (Python: update_user)
  // ==============================================================
  async updateUser(
    dto: UserUpdateSchema,
    updatedBy: number,
    tx?: Transaction,
  ): Promise<UserMstr | null> {
    const ormUser = await UserMstr.findByPk(dto.userId, {
      include: USER_INCLUDE,
      transaction: tx,
    });

    if (!ormUser) return null;

    const domainUser = UserMapper.toDomain(ormUser);

    domainUser.updateFromDto(dto, updatedBy);

    UserMapper.updateOrmFromDomain(ormUser, domainUser);

    await ormUser.save({ transaction: tx });

    return ormUser;
  }

  // ==============================================================
  // 🔴 DELETE USER (Python: delete)
  // ==============================================================
  async delete(domainUser: User, tx?: Transaction): Promise<void> {
    const ormUser = await UserMstr.findByPk(domainUser.id, {
      transaction: tx,
    });

    if (!ormUser) return;

    await ormUser.destroy({ transaction: tx });
  }

  // ==============================================================
  // 🔵 GET BY ID ORM (Python: get_by_id_orm)
  // ==============================================================
  async getByIdOrm(userId: number, tx?: Transaction): Promise<UserMstr | null> {
    return UserMstr.findByPk(userId, {
      include: USER_INCLUDE,
      transaction: tx,
    });
  }

  // ==============================================================
  // 🔵 GET BY ID DOMAIN
  // ==============================================================
  async getById(userId: number, tx?: Transaction): Promise<User | null> {
    const orm = await this.getByIdOrm(userId, tx);
    return orm ? UserMapper.toDomain(orm) : null;
  }

  // ==============================================================
  // 🟣 GET BY EMAIL ORM (Python equivalent)
  // ==============================================================
  async getByEmailOrm(email: string, tx?: Transaction): Promise<UserMstr | null> {
    const lower = email.toLowerCase();
    const ormUser = await UserMstr.findOne({
      include: [
        {
          model: ContactMstr,
          as: "Contacts",
          required: true,
          where: Sequelize.where(
            Sequelize.fn("lower", Sequelize.col("ContactValue")),
            lower
          ),
        },
        { association: "Profile" },
        { model: SsoKey, as: "Sso" },
      ],
      transaction: tx,
    });    
    return ormUser;
  }

  async getByEmail(email: string, tx?: Transaction): Promise<User | null> {
    const orm = await this.getByEmailOrm(email, tx);
    return orm ? UserMapper.toDomain(orm) : null;
  }

  // ==============================================================
  // 🟢 SAVE DOMAIN USER (Python: save)
  // ==============================================================
  async save(domainUser: User, tx?: Transaction): Promise<void> {
    const ormUser = await UserMstr.findByPk(domainUser.id, {
      include: USER_INCLUDE,
      transaction: tx,
    });

    if (!ormUser) return;

    UserMapper.updateOrmFromDomain(ormUser, domainUser);

    await ormUser.save({ transaction: tx });
    if (ormUser.Profile) {
      console.log("Saving profile...", ormUser.Profile.toJSON());
      await ormUser.Profile.save({ transaction: tx });
    }

    if (ormUser.Contacts) {
      console.log("Saving contacts...", ormUser.Contacts.map((c) => c.toJSON()));
      for (const contact of ormUser.Contacts) {
        await contact.save({ transaction: tx });
      }
    }
    if (ormUser.Sso) {
      ormUser.Sso.UserId = ormUser.UserId; // ensure FK is set
      console.log("Saving SSO...", ormUser.Sso.toJSON());
      await ormUser.Sso.save({ transaction: tx });
    }
  }

  // ==============================================================
  // 🔐 PASSWORD OPERATIONS (Python-style domain delegation)
  // ==============================================================
  async changePassword(userId: number, newHash: string, tx?: Transaction): Promise<void> {
    const ormUser = await this.getByIdOrm(userId, tx);
    if (!ormUser) return;

    const domainUser = UserMapper.toDomain(ormUser);

    domainUser.changePassword(newHash);
    domainUser.unlock();
    domainUser.recordFailedLogin(); // resets internally via changePassword logic

    UserMapper.updateOrmFromDomain(ormUser, domainUser);

    await ormUser.save({ transaction: tx });
  }

  // ==============================================================
  // 🔧 RELATION SAVER (centralized like Python flush model)
  // ==============================================================
  private async saveRelations(ormUser: UserMstr, tx?: Transaction) {
    await ormUser.Profile?.save({ transaction: tx });

    if (ormUser.Contacts?.length) {
      for (const c of ormUser.Contacts) {
        await c.save({ transaction: tx });
      }
    }

    await ormUser.Sso?.save({ transaction: tx });
  }

  async getByUsername(username: string, tx?: Transaction): Promise<User | null> {
    if (!username?.trim()) return null;

    const ormUser = await UserMstr.findOne({
      where: { Username: username },
      include: USER_INCLUDE,
      transaction: tx,
    });

    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }

  async getBySsoId(
    ssoKey: string,
    ssoType: number,
    tx?: Transaction,
  ): Promise<User | null> {
    const ormUser = await UserMstr.findOne({
      include: [
        { association: "Profile" },
        { model: ContactMstr, as: "Contacts" },
        {
          model: SsoKey,
          as: "Sso",
          where: {
            SsoId: ssoKey,
            TypeId: ssoType,
          },
        },
      ],
      transaction: tx,
    });

    return ormUser ? UserMapper.toDomain(ormUser) : null;
  }
}