// ===================================================================
// 🧩 App/Application/Services/Base/UserFactory.ts
// ===================================================================

import { User } from "@Domain/Entities/Base/User/User.ts";
import { UserProfile } from "@Domain/Entities/Base/User/Profile.ts";
import { Contact } from "@Domain/Entities/Base/User/Contact.ts";
import { BcryptPasswordHasher } from "@Infrastructure/Auth/BcryptPasswordHasher.ts";
import { AppTime } from "@Infrastructure/Core/AppTime.ts";
import { ContactTypes } from "@Infrastructure/Persistence/Models/Constants/ContactTypes.ts";

export interface BuildUserOptions {
  username: string;
  password?: string;
  firstname: string;
  lastname: string;
  createdBy: number;
  email?: string;
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
  return new User({
    username,
    password_hash: passwordHash,
    created_by: createdBy,
    beg_date: AppTime.utcNow(),
    end_date: AppTime.maxDate(),
    updated_by: updatedBy ?? undefined,
    profile,
    contacts,
    sso: null,
  });
}

// // src/Application/Services/Base/UserFactory.ts
// import { Contact } from "@Domain/Entities/Base/User/Contact.ts";
// import { User } from "@Domain/Entities/Base/User/User.ts";
// import { UserProfile } from "@Domain/Entities/Base/User/Profile.ts";
// import { AppTime } from "@Infrastructure/Core/AppTime.ts";
// import { ContactTypes } from "@Infrastructure/Persistence/Models/Constants/ContactTypes.ts";
// import { BcryptPasswordHasher } from "@Infrastructure/Auth/BcryptPasswordHasher.ts";

// export async function buildUser(params: {
//   username: string;
//   password: string;
//   firstname: string;
//   lastname: string;
//   createdBy: number;
//   email?: string;
//   isEmailValidated?: boolean;
// }): Promise<User> {
//   const {
//     username,
//     password,
//     firstname,
//     lastname,
//     createdBy,
//     email = "",
//     isEmailValidated = false,
//   } = params;

//   // Hash password
//   const passwordHasher = new BcryptPasswordHasher();
//   const passwordHash = await passwordHasher.hash(password);

//   // Build profile entity
//   const profileEntity = new UserProfile(firstname, lastname, createdBy);

//   // Build contacts
//   const contacts: Contact[] = [];
//   if (email) {
//     contacts.push(
//       new Contact({
//         contactTypeId: ContactTypes.Email,
//         contactValue: email,
//         validated: isEmailValidated,
//         isPrimary: true,
//         createdBy,
//         createdOn: AppTime.utcNow(),
//       })
//     );
//   }

//   // Build domain user
//   const domainUser = new User({
//     username,
//     passwordHash,
//     createdBy,
//     begDate: AppTime.utcNow(),
//     endDate: AppTime.maxDate(),
//     profile: profileEntity,
//     contacts,
//   });

//   return domainUser; // ✅ PURE DOMAIN OBJECT
// }
