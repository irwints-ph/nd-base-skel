// ===================================================================
// 🧩 App/Application/Services/Base/UserFactory.ts
// ===================================================================

import { User } from "@Domain/Entities/Base/User/User.ts";
import { UserProfile } from "@Domain/Entities/Base/User/Profile.ts";
import { Contact } from "@Domain/Entities/Base/User/Contact.ts";
import { BcryptPasswordHasher } from "@Infrastructure/Auth/BcryptPasswordHasher.ts";
import { AppTime } from "@Infrastructure/Core/AppTime.ts";
import { ContactTypes } from "@Infrastructure/Persistence/Models/Constants/ContactTypes.ts";
import SsoKey from "04-Infrastructure/Persistence/Models/Base/SsoKey.ts";

export interface BuildUserOptions {
  username: string;
  password?: string;
  firstname: string;
  lastname: string;
  createdBy: number;
  email?: string;
  ssoId?: string | null;
  is_email_validated?: boolean;
  updatedBy?: number | null;
}

export async function buildUser({
  username,
  password,
  firstname,
  lastname,
  createdBy,
  email = "",
  ssoId = null,
  is_email_validated = false,
  updatedBy = null,
}: BuildUserOptions): Promise<User> {
  // -----------------------------
  // Hash password
  // -----------------------------
  // const passwordHash = password
  //   ? new await BcryptPasswordHasher().hash(password)
  //   : "1"; // default/fallback
  const passwordHasher = new BcryptPasswordHasher();
  const passwordHash = password ? await passwordHasher.hash(password) : "1"; // default/fallback

  // -----------------------------
  // Build profile
  // -----------------------------
  const profile = new UserProfile(
    firstname,
    lastname,
    createdBy,
  );

  // -----------------------------
  // Build contacts (primary email)
  // -----------------------------
  const contacts: Contact[] = [];
  if (email) {
    contacts.push(
      new Contact({
        contactTypeId: ContactTypes.Email,
        contactValue: email,
        validated: is_email_validated,
        isPrimary: true,
        createdBy: createdBy,
        createdOn: AppTime.utcNow(),
      })
    );
  }
  // -----------------------------
  // Build domain user
  // -----------------------------
  const domainUser = new User({
    username,
    password_hash: passwordHash,
    created_by: createdBy,
    beg_date: AppTime.utcNow(),
    end_date: AppTime.maxDate(),
    updated_by: updatedBy ?? undefined,
    profile,
    contacts,
    // sso: null,
  });

  if(ssoId){
    domainUser.addSso(
      ssoId,
      1,
      createdBy
    );
  }
  return domainUser;
}
