// ===================================================================
// 🧩 UserMapper.ts (REFINED)
// ===================================================================

import { AppTime } from "#Infrastructure/Core/AppTime.ts";
import { DatabaseNamingConvention } from "#Infrastructure/Core/DatabaseNaming.ts";

import UserMstr from "#Infrastructure/Persistence/Models/Base/UserMstr.ts";
import ContactMstr from "#Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import SsoKey from "#Infrastructure/Persistence/Models/Base/SsoKey.ts";

import { User } from "#Domain/Entities/Base/User/User.ts";
import { Contact as DomainContact } from "#Domain/Entities/Base/User/Contact.ts";
import { Sso as DomainSso } from "#Domain/Entities/Base/User/Sso.ts";
import { UserProfile as DomainProfile } from "#Domain/Entities/Base/User/Profile.ts";

import UserProfileMapper from "./UserProfileMapper.ts";
import ContactMapper from "./ContactMapper.ts";
import SsoKeyMapper from "./SsoKeyMapper.ts";

export default class UserMapper {

  // =========================================================
  // 🔹 ORM → DOMAIN
  // =========================================================
  static toDomain(model: UserMstr): User {

    const profile: DomainProfile | null = model.Profile
      ? new DomainProfile(
          model.Profile.Firstname,
          model.Profile.Lastname,
          model.Profile.CreatedBy ?? undefined
        )
      : null;

    const contacts: DomainContact[] =
      model.Contacts?.map(c =>
        new DomainContact({
          id: c.Id,
          contactTypeId: c.ContactTypeId,
          contactValue: c.ContactValue,
          isPrimary: c.IsPrimary,
          validated: c.Validated,
          validationDate: c.ValidationDate ?? null,
          userId: c.UserId,
          createdBy: c.CreatedBy ?? undefined,
          createdOn: c.CreatedOn ?? undefined,
          updatedBy: c.UpdatedBy ?? undefined,
          updatedOn: c.UpdatedOn ?? undefined,
        })
      ) ?? [];

    const sso: DomainSso | null = model.Sso
      ? new DomainSso({
          type_id: model.Sso.TypeId,
          sso_id: model.Sso?.SsoId ?? "",
          created_by: model.Sso.CreatedBy ?? undefined,
        })
      : null;

    return new User({
      user_id: model.UserId,
      username: model.Username,
      password_hash: model.Password,
      beg_date: model.BegDate,
      end_date: model.EndDate,
      created_by: model.CreatedBy ?? undefined,
      created_on: model.CreatedOn ?? undefined,
      updated_by: model.UpdatedBy ?? undefined,
      updated_on: model.UpdatedOn ?? undefined,
      profile,
      contacts,
      sso,
      must_change_password: model.MustChangePassword ?? undefined,
      failed_attempts: model.FailedAttempts ?? undefined,
      is_locked: model.IsLocked ?? undefined,
      password_last_changed: model.PasswordLastChanged ?? undefined,
      // password_history: (model.PasswordHistory?.split(",") if model.PasswordHistory else []),

    });
  }

  // =========================================================
  // 🔹 DOMAIN → ORM
  // =========================================================
  static toOrm(domain: User): UserMstr {

    const orm = UserMstr.build({
      Username: domain.username,
      Password: domain.password_hash,
      BegDate: domain.beg_date,
      EndDate: domain.end_date,
      CreatedBy: domain.created_by,
      CreatedOn: AppTime.utcNow(),
    });

    if (domain.profile) {
      orm.Profile = UserProfileMapper.toOrm(domain.profile);
    }

    if (domain.contacts?.length) {
      orm.Contacts = domain.contacts.map(c =>
        ContactMapper.toOrm(c)
      );
    }

    if (domain.sso) {
      orm.Sso = SsoKeyMapper.toOrm(domain.sso);
    }

    if (domain.id) {
      orm.UserId = domain.id;
    }

    return orm;
  }

  // =========================================================
  // 🔹 UPDATE ORM FROM DOMAIN (FIXED - CLEAN + SAFE)
  // =========================================================
  static updateOrmFromDomain(
    ormUser: UserMstr,
    domainUser: User
  ): Record<string, any> {

    const oldValues: Record<string, any> = {
      profile: null,
      contacts: [],
      sso: null,
    };

    // -------------------------
    // USER SCALARS
    // -------------------------
    oldValues.username = ormUser.Username;

    ormUser.Username = domainUser.username;
    ormUser.UpdatedBy = domainUser.updated_by ?? null;
    ormUser.UpdatedOn = AppTime.utcNow();

    // -------------------------
    // PROFILE
    // -------------------------
    if (ormUser.Profile && domainUser.profile) {

      oldValues.profile = {
        Firstname: ormUser.Profile.Firstname,
        Lastname: ormUser.Profile.Lastname,
      };

      ormUser.Profile.Firstname = domainUser.profile.Firstname;
      ormUser.Profile.Lastname = domainUser.profile.Lastname;
      ormUser.Profile.UpdatedBy = domainUser.updated_by ?? null;
      ormUser.Profile.UpdatedOn = AppTime.utcNow();
    }

    // -------------------------
    // CONTACTS (FIXED: USE Id, NOT ContactTypeId)
    // -------------------------
    const existingContacts = new Map<number, ContactMstr>();

    for (const c of ormUser.Contacts ?? []) {
      existingContacts.set(c.Id, c);

      oldValues.contacts.push({
        Id: c.Id,
        ContactValue: c.ContactValue,
        IsPrimary: c.IsPrimary,
        Validated: c.Validated,
      });
    }

    ormUser.Contacts = ormUser.Contacts ?? [];

    for (const c of domainUser.contacts ?? []) {

      // 🔥 FIX: use Contact.Id if exists
      const existing = c.Id ? existingContacts.get(c.Id) : undefined;

      if (existing) {

        existing.ContactValue = c.ContactValue;
        existing.IsPrimary = c.IsPrimary;
        existing.Validated = c.Validated;
        existing.ValidationDate = c.ValidationDate ?? null;
        existing.UpdatedBy = domainUser.updated_by ?? null;
        existing.UpdatedOn = AppTime.utcNow();

      } else {

        const newContact = ContactMstr.build({
          UserId: ormUser.UserId,
          ContactTypeId: c.ContactTypeId,
          ContactValue: c.ContactValue,
          IsPrimary: c.IsPrimary,
          Validated: c.Validated,
          ValidationDate: c.ValidationDate ?? null,
          CreatedBy: c.CreatedBy,
          CreatedOn: AppTime.utcNow(),
        });

        ormUser.Contacts.push(newContact);
      }
    }

    // -------------------------
    // SSO (FIXED naming consistency)
    // -------------------------
    if (domainUser.sso) {

      oldValues.sso = ormUser.Sso
        ? {
            SsoId: ormUser.Sso.SsoId,
            TypeId: ormUser.Sso.TypeId,
          }
        : null;

      if (ormUser.Sso) {

        ormUser.Sso.SsoId = domainUser.sso.sso_id;
        ormUser.Sso.TypeId = domainUser.sso.type_id;
        ormUser.Sso.UpdatedBy = domainUser.sso.created_by ?? null;
        ormUser.Sso.UpdatedOn = AppTime.utcNow();

      } else {

        ormUser.Sso = SsoKey.build({
          SsoId: domainUser.sso.sso_id,
          TypeId: domainUser.sso.type_id,
          CreatedBy: domainUser.sso.created_by ?? null,
          CreatedOn: AppTime.utcNow(),
        });
      }
    }

    return oldValues;
  }
}