// src/Infrastructure/Persistence/Models/Base/index.ts

import UserMstr from "./UserMstr.ts";
import UserProfile from "./UserProfile.ts";
import SsoType from "./SsoType.ts";
import SsoKey from "./SsoKey.ts";
import ContactType from "./ContactType.ts";
import ContactMstr from "./ContactMstr.ts";
import ApiClient from "./ApiClient.ts";
import Otps from "./Otps.ts";
import AuditLogs from "./AuditLogs.ts";
import DefaultConfigurationMstr from "./DefaultConfigurationMstr.ts"

// Optional: export all as a "dictionary" for dynamic access
export const BaseModels = {
  UserMstr,
  UserProfile,
  SsoType,
  SsoKey,
  ContactType,
  ContactMstr,
  ApiClient,
  Otps,
  AuditLogs,
  DefaultConfigurationMstr,
};

// Also export individually for direct imports
export {
  UserMstr,
  UserProfile,
  SsoType,
  SsoKey,
  ContactType,
  ContactMstr,
  ApiClient,
  Otps,
  AuditLogs,
  DefaultConfigurationMstr,
};
