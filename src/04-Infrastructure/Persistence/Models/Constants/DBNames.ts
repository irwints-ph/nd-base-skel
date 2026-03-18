import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts"

export const SsoTypeTableName = DatabaseNamingConvention.getName("SsoType");
export const ContactTypeTableName = DatabaseNamingConvention.getName("ContactTypes");
export const ModuleMstrTableName = DatabaseNamingConvention.getName("ModuleMstr");

export const DfltCfgMstrTableName = DatabaseNamingConvention.getName("DefaultConfigurationMstr");