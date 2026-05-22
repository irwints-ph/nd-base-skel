// ==================================================================
// 🧩 src/03-Domain/Entities/Base/User/User.ts
// ==================================================================

import { Contact } from "./Contact.ts";
import { UserProfile } from "./Profile.ts";
import { UserUpdateInfo } from "./UserUpdateInfo.ts";
import { Sso } from "./Sso.ts";

import { AppTime } from "#Infrastructure/Core/AppTime.ts";

type UserConstructorParams = {
  user_id?: number;

  username: string;
  password_hash: string;

  beg_date?: Date;
  end_date?: Date;

  profile?: UserProfile | null;
  contacts?: Contact[];
  sso?: Sso | null;

  // --------------------------------------------------
  // 🔐 Security fields (from DB)
  // --------------------------------------------------
  must_change_password?: boolean;
  failed_attempts?: number;
  is_locked?: boolean;

  password_last_changed?: Date | null;
  password_history?: string[] | []| null;

  created_by?: number;
  created_on?: Date;

  updated_by?: number;
  updated_on?: Date;
};

export class User {
  // --------------------------------------------------
  // Identity
  // --------------------------------------------------
  id?: number;
  username: string;
  password_hash: string;

  // --------------------------------------------------
  // Lifecycle
  // --------------------------------------------------
  beg_date?: Date;
  end_date?: Date;

  // --------------------------------------------------
  // Profile / relations
  // --------------------------------------------------
  profile: UserProfile | null;
  contacts: Contact[];
  sso: Sso | null;

  // --------------------------------------------------
  // 🔐 Security state
  // --------------------------------------------------
  must_change_password: boolean;
  failed_attempts: number;
  is_locked: boolean;

  password_last_changed: Date | null;
  password_history: string[] | []| null;

  // --------------------------------------------------
  // Audit
  // --------------------------------------------------
  created_by?: number;
  created_on?: Date;

  updated_by?: number;
  updated_on?: Date;

  constructor(data: UserConstructorParams) {
    // identity
    this.id = data.user_id;
    this.username = data.username;
    this.password_hash = data.password_hash;

    // lifecycle
    this.beg_date = data.beg_date;
    this.end_date = data.end_date;

    // relations
    this.profile = data.profile ?? null;
    this.contacts = data.contacts ?? [];
    this.sso = data.sso ?? null;

    // security
    this.must_change_password = data.must_change_password ?? false;
    this.failed_attempts = data.failed_attempts ?? 0;
    this.is_locked = data.is_locked ?? false;

    this.password_last_changed =
      data.password_last_changed ?? null;

    this.password_history =
      data.password_history ?? null;

    // audit
    this.created_by = data.created_by;
    this.created_on = data.created_on;

    this.updated_by = data.updated_by;
    this.updated_on = data.updated_on;
  }

  // ==============================================================
  // 🔁 Factory helper
  // ==============================================================
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

      must_change_password: this.must_change_password,
      failed_attempts: this.failed_attempts,
      is_locked: this.is_locked,

      password_last_changed: this.password_last_changed,
      password_history: this.password_history,

      created_by: this.created_by,
      created_on: this.created_on,
    });
  }

  // ==============================================================
  // ⏱ Lifecycle
  // ==============================================================
  get isActive(): boolean {
    const now = new Date();

    return Boolean(
      this.beg_date &&
        this.end_date &&
        this.beg_date <= now &&
        now <= this.end_date,
    );
  }

  // ==============================================================
  // 🔐 Password domain behavior
  // ==============================================================
  changePassword(newHash: string): void {
    this.password_hash = newHash;
    this.password_last_changed = AppTime.utcNow();
    this.failed_attempts = 0;
    this.must_change_password = false;
  }

  recordFailedLogin(): void {
    this.failed_attempts++;

    if (this.failed_attempts >= 5) {
      this.is_locked = true;
    }
  }

  unlock(): void {
    this.failed_attempts = 0;
    this.is_locked = false;
  }

  // ==============================================================
  // 📧 Contact helpers
  // ==============================================================
  hasPrimaryEmail(): boolean {
    return this.contacts.some((c) => c.IsPrimary);
  }

  getPrimaryEmail(): string | null {
    const primary = this.contacts.find((c) => c.IsPrimary);
    return primary?.ContactValue ?? null;
  }

  isEmailValidated(email: string): boolean {
    const normalized = email.trim().toLowerCase();

    const contact = this.contacts.find(
      (c) =>
        c.ContactValue?.toLowerCase() === normalized,
    );

    return Boolean(contact?.Validated);
  }

  validateEmail(email: string): string {
    if (!email) throw new Error("Email cannot be empty.");

    const normalized = email.trim().toLowerCase();

    const pattern = /^[\w.-]+@[\w.-]+\.\w+$/;

    if (!pattern.test(normalized)) {
      throw new Error("Invalid email format.");
    }

    for (const c of this.contacts) {
      if (
        c.ContactValue?.toLowerCase() === normalized
      ) {
        if (!c.Validated) {
          c.Validated = true;
          c.ValidationDate = AppTime.appNow();
        }

        return normalized;
      }
    }

    return normalized;
  }

  // ==============================================================
  // 🧠 Profile + update logic
  // ==============================================================
  update(info: UserUpdateInfo, updatedBy: number): void {
    if (info.username) this.username = info.username;
    if (info.password) this.password_hash = info.password;
    if (info.begDate) this.beg_date = info.begDate;
    if (info.endDate) this.end_date = info.endDate;

    this.updated_by = updatedBy;
    this.updated_on = AppTime.utcNow();
  }

  updateFromDto(dto: UserUpdateInfo, updatedBy: number): void {
    if (dto.username) this.username = dto.username;
    if (dto.password) this.password_hash = dto.password;
    if (dto.begDate) this.beg_date = dto.begDate;
    if (dto.endDate) this.end_date = dto.endDate;

    if ((dto.firstname || dto.lastname) && this.profile) {
      if (dto.firstname) this.profile.Firstname = dto.firstname;
      if (dto.lastname) this.profile.Lastname = dto.lastname;
    }

    const existingContacts = new Map<number, Contact>();

    for (const c of this.contacts) {
      if (c.ContactTypeId) {
        existingContacts.set(c.ContactTypeId, c);
      }
    }

    for (const cDto of dto.contacts ?? []) {
      if (
        cDto.ContactTypeId &&
        existingContacts.has(cDto.ContactTypeId)
      ) {
        const c = existingContacts.get(cDto.ContactTypeId)!;

        if (cDto.ContactValue) {
          c.ContactValue = cDto.ContactValue;
        }

        if (cDto.IsPrimary !== undefined) {
          c.IsPrimary = cDto.IsPrimary;
        }
      } else {
        this.contacts.push(
          new Contact({
            contactTypeId: cDto.ContactTypeId,
            contactValue: cDto.ContactValue,
            isPrimary: cDto.IsPrimary ?? false,
          }),
        );
      }
    }

    this.updated_by = updatedBy;
    this.updated_on = AppTime.utcNow();
  }

  // ==============================================================
  // 🔗 SSO
  // ==============================================================
  addSso(
    ssoId: string,
    typeId: number,
    createdBy: number,
  ): void {
    if (!ssoId) throw new Error("SSO ID is required");

    if (this.sso) {
      this.sso.updateSso(ssoId, createdBy);
    } else {
      this.sso = new Sso({
        type_id: typeId,
        sso_id: ssoId,
        created_by: createdBy,
        created_on: AppTime.appNow(),
      });
    }

    this.updated_by = createdBy;
    this.updated_on = AppTime.appNow();
  }
}