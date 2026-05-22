// ===================================================================
// 🧩 App/Application/Services/Base/UserFactory.ts
// ===================================================================

import { User } from "#Domain/Entities/Base/User/User.ts";
import { UserProfile } from "#Domain/Entities/Base/User/Profile.ts";
import { Contact } from "#Domain/Entities/Base/User/Contact.ts";
import { BcryptPasswordHasher } from "#Infrastructure/Auth/BcryptPasswordHasher.ts";
import { AppTime } from "#Infrastructure/Core/AppTime.ts";
import { ContactTypes } from "#Infrastructure/Persistence/Models/Constants/ContactTypes.ts";

export interface BuildUserOptions {
  username: string;
  password?: string;

  firstname: string;
  lastname: string;

  createdBy: number;

  email?: string;

  ssoId?: string | null;

  // --------------------------------------------------
  // 🟢 Domain flags (aligned with Python version)
  // --------------------------------------------------
  isEmailValidated?: boolean;
  mustChangePassword?: boolean;
  isActive?: boolean;

  updatedBy?: number | null;

  roles?: string[];
}

export async function buildUser({
  username,
  password,

  firstname,
  lastname,

  createdBy,
  email = "",

  ssoId = null,

  isEmailValidated = false,
  mustChangePassword = true,
  isActive = true,

  updatedBy = null,

  roles = [],
}: BuildUserOptions): Promise<User> {
  // --------------------------------------------------
  // 🔐 Password hashing
  // --------------------------------------------------
  const passwordHasher = new BcryptPasswordHasher();
  const passwordHash = password
    ? await passwordHasher.hash(password)
    : "1";

  // --------------------------------------------------
  // 👤 Profile
  // --------------------------------------------------
  const profile = new UserProfile(
    firstname,
    lastname,
    createdBy,
  );

  // --------------------------------------------------
  // 📧 Contacts (email = source of truth)
  // --------------------------------------------------
  const contacts: Contact[] = [];

  if (email) {
    contacts.push(
      new Contact({
        contactTypeId: ContactTypes.Email,
        contactValue: email,
        validated: isEmailValidated,
        isPrimary: true,
        createdBy,
        createdOn: AppTime.utcNow(),
      }),
    );
  }

  // --------------------------------------------------
  // 🧠 Domain user aggregate
  // --------------------------------------------------
  const domainUser = new User({
    username,
    password_hash: passwordHash,

    created_by: createdBy,
    updated_by: updatedBy ?? undefined,

    beg_date: AppTime.utcNow(),
    end_date: AppTime.maxDate(),

    profile,
    contacts,
  });

  // --------------------------------------------------
  // 🔗 SSO (domain method, not ORM)
  // --------------------------------------------------
  if (ssoId) {
    domainUser.addSso(
      ssoId,
      1,
      createdBy,
    );
  }

  // --------------------------------------------------
  // ⚙️ Optional domain-level flags (if supported)
  // --------------------------------------------------
  (domainUser as any).must_change_password = mustChangePassword;
  (domainUser as any).is_active = isActive;
  (domainUser as any).roles = roles;

  return domainUser;
}