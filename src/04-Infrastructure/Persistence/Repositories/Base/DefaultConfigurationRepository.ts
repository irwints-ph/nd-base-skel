// src/infrastructure/repositories/base/DefaultConfigurationRepository.ts
import DefaultConfigurationMstr  from "@Infrastructure/Persistence/Models/Base/DefaultConfigurationMstr.ts";
import { IDefaultConfigurationRepository } from "@Domain/Interfaces/Base/IDefaultConfigurationRepository.ts";
import { Transaction } from "sequelize";
export class DefaultConfigurationRepository implements IDefaultConfigurationRepository {
  constructor() {
    // If you want dependency injection, you can pass a Sequelize instance here
  }

  async getDefaultGroupRoles(tx?: Transaction): Promise<number[]> {
    const cfg = await DefaultConfigurationMstr.findOne({
      where: {
        ValueKey: "DefaultGroup",
        IsActive: 1,
      },
      transaction: tx,
    });

    if (cfg && cfg.ValueLow) {
      return cfg.ValueLow
        .split(",")
        .map(rid => rid.trim())
        .filter(rid => /^\d+$/.test(rid))
        .map(rid => parseInt(rid, 10));
    }

    return [];
  }
}
