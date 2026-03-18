// src/04-Infrastructure/Persistence/Models/types.ts
import type { ModelStatic } from "sequelize";
import UserMstr from "./Base/UserMstr.ts";
import UserProfile from "./Base/UserProfile.ts";
import SsoKey from "./Base/SsoKey.ts";
import SsoType from "./Base/SsoType.ts";
import ContactMstr from "./Base/ContactMstr.ts";
import ContactType from "./Base/ContactType.ts";
import ApiClient from "./Base/ApiClient.ts";
import Otp from "./Base/Otps.ts";
import AuditLogs from "./Base/AuditLogs.ts";

import ModuleMstr from "./Auth/ModuleMstr.ts";
import RoleMstr from "./Auth/RoleMstr.ts";
import RoleModuleMstr from "./Auth/RoleModuleMstr.ts";
import RoleUserMstr from "./Auth/RoleUserMstr.ts";
import DefaultConfigurationMstr from "./Base/DefaultConfigurationMstr.ts";


export interface Models {
  // UserMstr: typeof UserMstr;
  // UserProfile: typeof UserProfile;
  // SsoKey: typeof SsoKey;
  
  UserMstr: ModelStatic<UserMstr>;
  UserProfile: ModelStatic<UserProfile>;
  SsoKey: ModelStatic<SsoKey>;
  SsoType: ModelStatic<SsoType>;
  ContactMstr: ModelStatic<ContactMstr>;
  ContactType: ModelStatic<ContactType>;
  ApiClient: ModelStatic<ApiClient>;
  Otp: ModelStatic<Otp>;
  AuditLogs: ModelStatic<AuditLogs>;
  DefaultConfigurationMstr: ModelStatic<DefaultConfigurationMstr>;

  ModuleMstr: ModelStatic<ModuleMstr>;
  RoleMstr: ModelStatic<RoleMstr>;
  RoleModuleMstr: ModelStatic<RoleModuleMstr>;
  RoleUserMstr: ModelStatic<RoleUserMstr>;

}
