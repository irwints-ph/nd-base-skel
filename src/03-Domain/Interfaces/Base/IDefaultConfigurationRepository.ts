// ===================================================================
// 🧩 src/03-Domain/Interfaces/Base/IDefaultConfigurationRepository.ts
// ===================================================================
import { DefaultConfiguration } from "#Domain/Entities/Base/DefaultConfiguration.ts";
import DefaultConfigurationMstr from "#Infrastructure/Persistence/Models/Base/DefaultConfigurationMstr.ts";
import { Transaction } from "sequelize";

export interface IDefaultConfigurationRepository {
  getDefaultGroupRoles(tx?: Transaction): Promise<number[]>;
}