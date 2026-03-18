// src/04-Infrastructure/Core/InitModels.ts
import { Sequelize } from "sequelize"
import type { Models } from "@Infrastructure/Persistence/Models/types.ts";

import UserMstr from "@Infrastructure/Persistence/Models/Base/UserMstr.ts"
import UserProfile from "@Infrastructure/Persistence/Models/Base/UserProfile.ts"
import ContactType from "@Infrastructure/Persistence/Models/Base/ContactType.ts"
import ContactMstr from "@Infrastructure/Persistence/Models/Base/ContactMstr.ts"
import SsoType from "@Infrastructure/Persistence/Models/Base/SsoType.ts"
import SsoKey from "@Infrastructure/Persistence/Models/Base/SsoKey.ts"
import ApiClient from "@Infrastructure/Persistence/Models/Base/ApiClient.ts"
import Otp from "@Infrastructure/Persistence/Models/Base/Otps.ts"
import AuditLogs from "@Infrastructure/Persistence/Models/Base/AuditLogs.ts"
import DefaultConfigurationMstr from "@Infrastructure/Persistence/Models/Base/DefaultConfigurationMstr.ts"


import ModuleMstr from "@Infrastructure/Persistence/Models/Auth/ModuleMstr.ts";
import RoleMstr from "@Infrastructure/Persistence/Models/Auth/RoleMstr.ts";
import RoleModuleMstr from "@Infrastructure/Persistence/Models/Auth/RoleModuleMstr.ts";
import RoleUserMstr from "@Infrastructure/Persistence/Models/Auth/RoleUserMstr.ts";


// import { ModuleMstr, RoleMstr, RoleModule, RoleUser} from "@/03-domain/models/auth/index.ts"
export function InitModels(sequelize: Sequelize) {
  // Step 1: Initialize models
  const models: Models = {
    UserMstr: UserMstr.initModel(sequelize),
    UserProfile: UserProfile.initModel(sequelize),
    ContactType: ContactType.initModel(sequelize),
    ContactMstr: ContactMstr.initModel(sequelize),
    SsoType: SsoType.initModel(sequelize),
    SsoKey: SsoKey.initModel(sequelize),
    // Add more models here as needed
    AuditLogs: AuditLogs.initModel(sequelize),
    ApiClient: ApiClient.initModel(sequelize),
    Otp: Otp.initModel(sequelize),
    DefaultConfigurationMstr: DefaultConfigurationMstr.initModel(sequelize),

    ModuleMstr: ModuleMstr.initModel(sequelize),
    RoleMstr: RoleMstr.initModel(sequelize),
    RoleModuleMstr: RoleModuleMstr.initModel(sequelize),
    RoleUserMstr: RoleUserMstr.initModel(sequelize),
  };

  // Step 2: Set up associations
  Object.values(models).forEach((model) => {
    if (typeof (model as any).associate === "function") {
      (model as any).associate(models);
    }
  });

  return models;  
  // // Init models
  // UserMstr.initModel(sequelize)
  // UserProfile.initModel(sequelize)
  // ContactType.initModel(sequelize)
  // ContactMstr.initModel(sequelize)
  // SsoType.initModel(sequelize)
  // SsoKey.initModel(sequelize)
  // // ModuleMstr.initModel(sequelize)
  // // RoleMstr.initModel(sequelize)
  // // RoleModule.initModel(sequelize)
  // // RoleUser.initModel(sequelize)

  // // Associations
  // UserMstr.associate?.()
  // // ContactType.associate?.()
  // // ContactMstr.associate?.()
  // // SsoType.associate?.()
  // // SsoKey.associate?.()
  // // ModuleMstr.associate?.()
  // // RoleMstr.associate?.()
  // // RoleModule.associate?.()
  // // RoleUser.associate?.()
}
