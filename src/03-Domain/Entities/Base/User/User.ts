// ==================================================================
// 🧩 src/03-Domain/Entities/Base/User/User.ts
// ==================================================================

import { Contact } from "./Contact.ts";
import { UserProfile } from "./Profile.ts";
import { UserUpdateInfo } from "./UserUpdateInfo.ts";
import { Sso } from "./Sso.ts";

import { AppTime } from "@Infrastructure/Core/AppTime.ts";

export class User {

  id?: number;

  username: string;
  password_hash: string;

  beg_date?: Date;
  end_date?: Date;

  profile?: UserProfile | null;

  contacts: Contact[] = [];

  sso?: Sso | null;

  created_by?: number;
  created_on?: Date;

  updated_by?: number;
  updated_on?: Date;

  constructor({
    user_id,
    username,
    password_hash,
    beg_date,
    end_date,
    profile,
    contacts,
    sso,
    created_by,
    created_on,
    updated_by,
    updated_on
  }: {
    user_id?: number
    username: string
    password_hash: string
    beg_date?: Date
    end_date?: Date
    profile?: UserProfile | null
    contacts?: Contact[]
    sso?: Sso | null
    created_by?: number
    created_on?: Date
    updated_by?: number
    updated_on?: Date
  }) {

    this.id = user_id
    this.username = username
    this.password_hash = password_hash
    this.beg_date = beg_date
    this.end_date = end_date
    this.profile = profile ?? null
    this.contacts = contacts ?? []
    this.sso = sso ?? null
    this.created_by = created_by
    this.created_on = created_on
    this.updated_by = updated_by
    this.updated_on = updated_on

  }

  /* --------------------------------
     Domain rules
  -------------------------------- */

  withId(userId: number): User {

    return new User({
      user_id: userId,
      username: this.username,
      password_hash: this.password_hash,
      beg_date: this.beg_date,
      end_date: this.end_date,
      profile: this.profile,
      contacts: this.contacts,
      sso: this.sso,
      created_by: this.created_by
    })

  }

  get isActive(): boolean {

    const now = new Date()

    return !!(
      this.beg_date &&
      this.end_date &&
      this.beg_date <= now &&
      now <= this.end_date
    )

  }

  changePassword(newHash: string) {

    this.password_hash = newHash

  }

  hasPrimaryEmail(): boolean {

    return this.contacts.some(c => c.IsPrimary)

  }

  getPrimaryEmail(): string | null {

    for (const c of this.contacts) {

      if (c.IsPrimary) {
        return c.ContactValue
      }

    }

    return null

  }

  isEmailValidated(email: string): boolean {

    const contact = this.contacts.find(
      c => c.ContactValue === email
    )

    return !!contact?.Validated

  }

  update(info: UserUpdateInfo, updatedBy: number) {

    if (info.username) this.username = info.username
    if (info.password) this.password_hash = info.password
    if (info.begDate) this.beg_date = info.begDate
    if (info.endDate) this.end_date = info.endDate

    this.updated_by = updatedBy
    this.updated_on = AppTime.utcNow()

  }

  updateFromDto(dto: UserUpdateInfo, updatedBy: number) {

    if (dto.username) this.username = dto.username
    if (dto.password) this.password_hash = dto.password
    if (dto.begDate) this.beg_date = dto.begDate
    if (dto.endDate) this.end_date = dto.endDate

    if ((dto.firstname || dto.lastname) && this.profile) {

      if (dto.firstname)
        this.profile.Firstname = dto.firstname

      if (dto.lastname)
        this.profile.Lastname = dto.lastname

    }

    const existingContacts = new Map<number, Contact>()

    for (const c of this.contacts) {
      if (c.ContactTypeId)
        existingContacts.set(c.ContactTypeId, c)
    }

    for (const cDto of dto.contacts ?? []) {

      if (
        cDto.ContactTypeId &&
        existingContacts.has(cDto.ContactTypeId)
      ) {

        const c = existingContacts.get(cDto.ContactTypeId)!

        if (cDto.ContactValue)
          c.ContactValue = cDto.ContactValue

        if (cDto.IsPrimary !== undefined)
          c.IsPrimary = cDto.IsPrimary

      }
      else {

        this.contacts.push(
          new Contact({
            contactTypeId: cDto.ContactTypeId,
            contactValue: cDto.ContactValue,
            isPrimary: cDto.IsPrimary ?? false
          })
        )

      }

    }

    this.updated_by = updatedBy
    this.updated_on = AppTime.utcNow()

  }

  addSso(
    ssoId: string,
    typeId: number,
    createdBy: number
  ) {

    if (!ssoId)
      throw new Error("SSO ID is required")

    if (this.sso) {

      this.sso.updateSso(ssoId, createdBy)

    }
    else {

      this.sso = new Sso({
        type_id: typeId,
        sso_id: ssoId,
        created_by: createdBy
      })

    }

  }

  validateEmail(email: string): string {

    if (!email)
      throw new Error("Email cannot be empty.")

    email = email.trim().toLowerCase()

    const pattern =
      /^[\w.-]+@[\w.-]+\.\w+$/

    if (!pattern.test(email))
      throw new Error("Invalid email format.")

    for (const c of this.contacts) {

      if (
        c.ContactValue &&
        c.ContactValue.toLowerCase() === email
      ) {

        if (c.Validated)
          throw new Error(
            "Email already exists for user."
          )

        else
          c.Validated = true

      }

    }

    return email

  }

}