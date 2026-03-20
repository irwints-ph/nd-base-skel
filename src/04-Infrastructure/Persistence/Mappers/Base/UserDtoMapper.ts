// ===================================================================
// 🧩 srv/04-Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts
// ===================================================================

import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
import ContactMstr from "@Infrastructure/Persistence/Models/Base/ContactMstr.ts";
// import SsoKey from "@Infrastructure/Persistence/Models/Base/SsoKey.ts";
// import UserProfile from "@Infrastructure/Persistence/Models/Base/UserProfile.ts";
import { UserFlatBase } from "@Contracts/Base/Users/UserSchemas.ts";
import { logger } from "@Infrastructure/Core/Logger.ts";
import { AppTime } from "@Infrastructure/Core/AppTime.ts";

// Domain entity type (if you have one)
import { User } from "@Domain/Entities/Base/User/User.ts";
import SsoKey from "04-Infrastructure/Persistence/Models/Base/SsoKey.ts";

export class UserDtoMapper {
  // ------------------------
  // Map Domain User → DTO
  // ------------------------
  // static toDomainUserFlatBase(user: User | UserMstr | UserFlatBase | void): UserFlatBase {
  //   if ((user as UserFlatBase).userId !== undefined) {
  //     return user as UserFlatBase;
  //   }
    // const isOrm = user instanceof UserMstr;

    // const profile = isOrm ? (user as UserMstr).Profile : (user as User).profile;
    // const fullname = profile ? `${profile.Firstname} ${profile.Lastname}` : "";

  static toDomainUserFlatBase(user: User): UserFlatBase {

    const profile = (user as User).profile;
    const fullname = profile ? `${profile.Firstname} ${profile.Lastname}` : "";

    // Active flag
    let active: boolean = (user as any).is_active ?? false;

    // Primary email
    let primaryEmail: string | null = null;
    let emailIsActive = false;
    const contacts = (user as User).contacts;
    if (contacts) {
      for (const c of contacts as ContactMstr[]) {
        if (c.IsPrimary) {
          primaryEmail = c.ContactValue;
          emailIsActive = c.Validated ?? false;
          break;
        }
      }
    }

    // SSO
    let ssoId:string | null = "";
    try {
      const sso = (user as User).sso;
      ssoId = sso ? sso.sso_id : "";
    } catch (err) {
      logger.error("user.Sso: " + String(err));
    }

    const u = user as User;
    return {
      userId: u.id ?? 0,
      username: u.username,
      firstname: profile?.Firstname ?? "",
      lastname: profile?.Lastname ?? "",
      fullname,
      email: primaryEmail ?? "",
      emailIsActive,
      active,
      begDate: u.beg_date,
      endDate: u.end_date,
      createdBy: u.created_by,
      createdOn: u.created_on,
      updatedBy: u.updated_by,
      updatedOn: u.updated_on,
      ssoId,
    };
  }

  // ------------------------
  // Map ORM UserMstr → DTO
  // ------------------------
  static toOrmUserFlatBase(user: UserMstr): UserFlatBase | null {
    if (!(user instanceof UserMstr)) return null;

    const now = AppTime.appNow();

    const profile = user.Profile;
    const firstname = profile?.Firstname ?? "";
    const lastname = profile?.Lastname ?? "";
    const fullname = `${firstname} ${lastname}`.trim();

    const active = user.BegDate <= now && now <= user.EndDate;

    // Primary email
    let primaryEmail: string | null = null;
    let emailIsActive = false;
    for (const c of user.Contacts ?? []) {
      if (c.IsPrimary) {
        primaryEmail = c.ContactValue;
        emailIsActive = c.Validated ?? false;
        break;
      }
    }

    // SSO
    let ssoId:string | null = "";
    try {
      const sso:SsoKey | null = user.Sso ?? null;
      ssoId = sso ? sso.SsoId : "";
    } catch (err) {
      logger.error("user.Sso: " + String(err));
    }

    return {
      userId: user.UserId,
      username: user.Username,
      firstname,
      lastname,
      fullname,
      email: primaryEmail ?? "",
      emailIsActive,
      active,
      begDate: user.BegDate,
      endDate: user.EndDate,
      createdBy: user.CreatedBy,
      createdOn: user.CreatedOn,
      updatedBy: user.UpdatedBy,
      updatedOn: user.UpdatedOn,
      ssoId,
    };
  }

  // ------------------------
  // Map list of ORM Users → DTO list
  // ------------------------
  static toUserFlatBaseList(users: UserMstr[]): UserFlatBase[] {
    return users.map(u => this.toOrmUserFlatBase(u)!).filter(Boolean);
  }
}

// // ===================================================================
// // 🧩 App/Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts
// // ===================================================================

// import { User } from "@Domain/Entities/Base/User/User.ts";
// import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts";
// import { UserFlatBase } from "@Contracts/Base/Users/UserSchemas.ts";

// export class UserDtoMapper {
//   // -----------------------------
//   // Convert domain User or ORM → UserFlatBase
//   // -----------------------------
//   static toDomainUserFlatBase(user: User | UserMstr): UserFlatBase {
//     const isOrm = "UserId" in user; // detect ORM vs domain
//     const profile = isOrm ? (user as UserMstr).Profile : (user as User).profile;
//     const fullname = profile ? `${profile.Firstname} ${profile.Lastname}` : "";

//     // Active flag
//     // let active: boolean = isOrm
//     //   ? (user as UserMstr).isActive ?? false
//     //   : (user as User).isActive ?? false;
//     // if (typeof active === "function") active = active();
//     // Active flag based on EndDate
//     const now = new Date();
//     let active: boolean;
//     if (isOrm) {
//       const endDate = (user as UserMstr).EndDate;
//       active = !!endDate ? endDate > now : true; // Active if no end date or end date in the future
//     } else {
//       const endDate = (user as User).end_date;
//       active = !!endDate ? endDate > now : true;
//     }

//     // Primary email
//     const contacts = isOrm ? (user as UserMstr).Contacts : (user as User).contacts;
//     let primaryEmail: string | undefined = undefined;
//     let emailIsActive = false;
//     if (contacts && contacts.length > 0) {
//       for (const c of contacts) {
//         if ((c as any).IsPrimary) {
//           primaryEmail = (c as any).ContactValue;
//           emailIsActive = (c as any).Validated ?? false;
//           break;
//         }
//       }
//     }

//     // SSO
//     const sso = isOrm ? (user as UserMstr).Sso : (user as User).sso;
//     // const ssoId = sso?.SsoId ?? null;
//     // Determine SSO ID safely
//     let ssoId: string | null = null;

//     if (sso) {
//       // Narrow type for ORM (SsoKey)
//       if ("SsoId" in sso) {
//         ssoId = sso.SsoId ?? null;
//       } else if ("sso_id" in sso) {
//         // Domain Sso object
//         ssoId = sso.sso_id ?? null;
//       }
//     }
//     return {
//       userId: isOrm ? (user as UserMstr).UserId : (user as User).id ?? 0,
//       username: isOrm ? (user as UserMstr).Username : (user as User).username,
//       firstname: profile?.Firstname ?? "",
//       lastname: profile?.Lastname ?? "",
//       fullname,
//       email: primaryEmail,
//       emailIsActive,
//       active,
//       begDate: isOrm ? (user as UserMstr).BegDate : (user as User).beg_date ?? null,
//       endDate: isOrm ? (user as UserMstr).EndDate : (user as User).end_date ?? null,
//       createdBy: isOrm ? (user as UserMstr).CreatedBy : (user as User).created_by ?? null,
//       createdOn: isOrm ? (user as UserMstr).CreatedOn : (user as User).created_on ?? null,
//       updatedBy: isOrm ? (user as UserMstr).UpdatedBy : (user as User).updated_by ?? null,
//       updatedOn: isOrm ? (user as UserMstr).UpdatedOn : (user as User).updated_on ?? null,
//       ssoId,
//     };
//   }

//   // -----------------------------
//   // Convert ORM/domain list → UserFlatBase list
//   // -----------------------------
//   static toUserFlatBaseList(users: Array<User | UserMstr>): UserFlatBase[] {
//     return users.map(u => this.toDomainUserFlatBase(u));
//   }
// }