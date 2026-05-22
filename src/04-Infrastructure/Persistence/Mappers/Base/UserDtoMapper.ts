// ===================================================================
// 🧩 srv/04-Infrastructure/Persistence/Mappers/Base/UserDtoMapper.ts
// ===================================================================

import UserMstr from "#Infrastructure/Persistence/Models/Base/UserMstr.ts";
import ContactMstr from "#Infrastructure/Persistence/Models/Base/ContactMstr.ts";
import SsoKey from "#Infrastructure/Persistence/Models/Base/SsoKey.ts";

import { UserFlatBase } from "#Contracts/Base/Users/UserSchemas.ts";
import { AppTime } from "#Infrastructure/Core/AppTime.ts";
import { logger } from "#Infrastructure/Core/Logger.ts";

import { User } from "#Domain/Entities/Base/User/User.ts";

export class UserDtoMapper {

  // =========================================================
  // 🔹 DOMAIN → DTO
  // =========================================================
  static toDomainUserFlatBase(user: User, the_token?: string | null): UserFlatBase {

    const profile = user.profile;

    const firstname = profile?.Firstname ?? "";
    const lastname = profile?.Lastname ?? "";
    const fullname = `${firstname} ${lastname}`.trim();

    const active = (user as any).is_active ?? false;

    // ------------------------
    // Primary email
    // ------------------------
    let primaryEmail: string | null = null;
    let emailIsActive = false;

    if (user.contacts?.length) {
      for (const c of user.contacts as any as ContactMstr[]) {
        if (c.IsPrimary) {
          primaryEmail = c.ContactValue;
          emailIsActive = c.Validated ?? false;
          break;
        }
      }
    }

    // ------------------------
    // SSO
    // ------------------------
    let ssoId: string | null = null;

    try {
      const sso = user.sso;
      ssoId = sso ? (sso as any).SsoId ?? null : null;
    } catch (err) {
      logger.error("user.sso error: " + String(err));
    }

    return {
      userId: user.id ?? 0,
      username: user.username ?? "",
      firstname,
      lastname,
      fullname,

      email: primaryEmail ?? "",
      emailIsActive,

      active,

      begDate: user.beg_date,
      endDate: user.end_date,

      createdBy: user.created_by,
      createdOn: user.created_on,
      updatedBy: user.updated_by,
      updatedOn: user.updated_on,
      ssoId: user.sso ? (user.sso as any).SsoId ?? null : null,
      mustChangePassword: user.must_change_password ?? undefined,
      failedAttempts: user.failed_attempts ?? undefined,
      isLocked: user.is_locked ?? undefined,
      passwordLastChanged: user.password_last_changed ?? undefined,
      passwordHistory: Array.isArray(user.password_history)
        ? user.password_history
        : user.password_history
          ? [user.password_history]
          : [],

      token:the_token ?? null,

    };
  }

  // =========================================================
  // 🔹 ORM → DTO
  // =========================================================
  static toOrmUserFlatBase(user: UserMstr, the_token?: string | null): UserFlatBase {

    const now = AppTime.appNow();

    const firstname = user.Profile?.Firstname ?? "";
    const lastname = user.Profile?.Lastname ?? "";
    const fullname = `${firstname} ${lastname}`.trim();

    const active = user.BegDate <= now && now <= user.EndDate;

    // ------------------------
    // Primary email
    // ------------------------
    let primaryEmail: string | null = null;
    let emailIsActive = false;

    if (user.Contacts?.length) {
      for (const c of user.Contacts as ContactMstr[]) {
        if (c.IsPrimary) {
          primaryEmail = c.ContactValue;
          emailIsActive = c.Validated ?? false;
          break;
        }
      }
    }

    // ------------------------
    // SSO
    // ------------------------
    let ssoId: string | null = null;

    try {
      const sso = user.Sso as SsoKey | null;
      ssoId = sso ? sso.SsoId : null;
    } catch (err) {
      logger.error("user.Sso error: " + String(err));
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

      ssoId: ssoId ?? "",
      token: the_token ?? null,
      mustChangePassword: user.MustChangePassword ?? undefined,
      failedAttempts: user.FailedAttempts ?? undefined,
      isLocked: user.IsLocked ?? undefined,
      passwordLastChanged: user.PasswordLastChanged ?? undefined,
      passwordHistory: Array.isArray(user.PasswordHistory)
        ? user.PasswordHistory
        : user.PasswordHistory
          ? [user.PasswordHistory]
          : [],

    };
  }

  // =========================================================
  // 🔹 LIST ORM → DTO
  // =========================================================
  static toUserFlatBaseList(users: UserMstr[]): UserFlatBase[] {
    return users
      .map(u => this.toOrmUserFlatBase(u))
      .filter(Boolean) as UserFlatBase[];
  }
}