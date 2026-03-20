// src/04-Infrastructure/Persistence/Mappers/Base/UserMapper.ts

import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";
import { AppTime } from "@Infrastructure/Core/AppTime.ts";

import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
import ContactMstr from "@Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import SsoKey from "@Infrastructure/Persistence/Models/Base/SsoKey.ts";

import { User } from "@Domain/Entities/Base/User/User.ts";
import { UserProfile as DomainProfile} from "@Domain/Entities/Base/User/Profile.ts";
import { Contact as DomainContact } from "@Domain/Entities/Base/User/Contact.ts";
import { Sso as DomainSso } from "@Domain/Entities/Base/User/Sso.ts";

import UserProfileMapper from "./UserProfileMapper.ts";
import ContactMapper  from "./ContactMapper.ts";
import SsoKeyMapper from "./SsoKeyMapper.ts";

export default class UserMapper {

  static toDomain(model: UserMstr): User {

    let profile: DomainProfile | null = null;

    if (model.Profile) {
      profile = new DomainProfile(
        model.Profile.Firstname,
        model.Profile.Lastname,
        model.Profile.CreatedBy ?? undefined
      );
    }

    const contacts: DomainContact[] = model.Contacts
      ? model.Contacts.map(c =>
          new DomainContact({
            contactTypeId: c.ContactTypeId,
            contactValue: c.ContactValue,
            isPrimary: c.IsPrimary,
            validated: c.Validated
          })
        )
      : [];

    let sso: DomainSso | null = null;

    if (model.Sso) {
      sso = new DomainSso({
        type_id: model.Sso.TypeId,
        sso_id: model.Sso.SsoId ?? "",
        created_by: model.Sso.CreatedBy ?? undefined,
      });
    }

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
      sso
    });

  }

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

  static updateOrmFromDomain(
    ormUser: UserMstr,
    domainUser: User
  ): Record<string, any> {

    const oldValues: Record<string, any> = {};

    /* --------------------------------
       Capture old scalar values
    -------------------------------- */

    for (const key of Object.keys(ormUser.get())) {
      const dbField =
        DatabaseNamingConvention.getToPascalCase(key);
      oldValues[dbField] = (ormUser as any)[dbField];
    }

    /* --------------------------------
       Profile snapshot
    -------------------------------- */

    if (ormUser.Profile) {
      oldValues.profile = {
        Firstname: ormUser.Profile.Firstname,
        Lastname: ormUser.Profile.Lastname
      };
    }

    /* --------------------------------
       Contacts snapshot
    -------------------------------- */

    oldValues.contacts = [];

    const existingContacts = new Map<number, ContactMstr>();
    for (const c of ormUser.Contacts || []) {
      existingContacts.set(c.ContactTypeId, c);
      oldValues.contacts.push({
        ContactId: c.ContactTypeId,
        ContactValue: c.ContactValue,
        IsPrimary: c.IsPrimary
      });
    }

    /* --------------------------------
       SSO snapshot
    -------------------------------- */

    if (ormUser.Sso) {
      oldValues.sso = {
        Sso: ormUser.Sso
      };
    }

    /* --------------------------------
       Apply domain updates
    -------------------------------- */

    domainUser.updated_on = AppTime.utcNow();

    if (domainUser.username) {
      ormUser.Username = domainUser.username;
    }

    ormUser.UpdatedBy = domainUser.updated_by ?? null;
    ormUser.UpdatedOn = domainUser.updated_on;

    let withChange = false;
    /* --------------------------------
       Profile updates
    -------------------------------- */
    if (ormUser.Profile && domainUser.profile) {
      withChange = false;
      if(ormUser.Profile.Firstname != domainUser.profile.Firstname){
        withChange = true;
        ormUser.Profile.Firstname = domainUser.profile.Firstname;
      }
      if(ormUser.Profile.Lastname != domainUser.profile.Lastname){
        withChange = true;
        ormUser.Profile.Lastname = domainUser.profile.Lastname;
      }
      if(withChange){
        ormUser.Profile.UpdatedBy = domainUser.updated_by ?? null;
        ormUser.Profile.UpdatedOn = domainUser.updated_on;
      }
    }

    /* --------------------------------
       Contacts updates
    -------------------------------- */

    for (const c of domainUser.contacts || []) {
      if (c.ContactTypeId &&
          existingContacts.has(c.ContactTypeId)) {

        const ormContact =
          existingContacts.get(c.ContactTypeId)!;
        withChange = false;
        if(
          ormContact.ContactValue != c.ContactValue ||
          ormContact.IsPrimary != c.IsPrimary  ||
          ormContact.Validated != c.Validated
        ) withChange = true;
        ormContact.ContactValue = c.ContactValue;
        ormContact.IsPrimary = c.IsPrimary;
        ormContact.Validated = c.Validated;
        ormContact.ValidationDate = c.ValidationDate ?? null;
        if(withChange){
          ormContact.UpdatedBy = domainUser.updated_by ?? null;
          ormContact.UpdatedOn = domainUser.updated_on;
        }

      }
      else {
        const newContact = ContactMstr.build({
          UserId: ormUser.UserId,
          ContactValue: c.ContactValue,
          IsPrimary: c.IsPrimary,
          Validated: c.Validated,
          ValidationDate: c.ValidationDate ?? null,
          CreatedBy: c.CreatedBy,
          CreatedOn: AppTime.utcNow()
        });
        ormUser.Contacts?.push(newContact);
      }

    }

    /* --------------------------------
       SSO updates
    -------------------------------- */
    if (domainUser.sso) {
      if (ormUser.Sso) {
        ormUser.Sso.SsoId = domainUser.sso.sso_id
        ormUser.Sso.TypeId = domainUser.sso.type_id
        ormUser.Sso.UpdatedBy = domainUser.sso.created_by ?? null
        ormUser.Sso.UpdatedOn = AppTime.utcNow()        
      }
      else {
        ormUser.Sso = SsoKey.build({
          SsoId: domainUser.sso.sso_id,
          TypeId: domainUser.sso.type_id,
          CreatedBy: domainUser.sso?.created_by ?? null,
          CreatedOn: AppTime.utcNow()
        });

      }
    }
    return oldValues;

  }

}