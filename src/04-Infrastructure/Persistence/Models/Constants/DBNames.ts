import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts"

export const SsoTypeTableName = DatabaseNamingConvention.getName("SsoType");
export const ContactTypeTableName = DatabaseNamingConvention.getName("ContactTypes");
export const ModuleMstrTableName = DatabaseNamingConvention.getName("ModuleMstr");
export const RoleMstrTableName = DatabaseNamingConvention.getName("RoleMstr");

export const RoleModuleTableName = DatabaseNamingConvention.getName("RoleModule");
export const RoleUserTableName = DatabaseNamingConvention.getName("RoleUser");


export const DfltCfgMstrTableName = DatabaseNamingConvention.getName("DefaultConfigurationMstr");