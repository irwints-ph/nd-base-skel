// src/Application/Handlers/Auth/CreateModuleHandler.ts
import { ModuleRepository } from "04-Infrastructure/Persistence/Repositories/Auth/ModuleRepository.ts";
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";
import { CreateModuleCommand } from "02-Application/Commands/Auth/CreateModuleCommandParams.ts";
import { buildModule } from "@Application/Services/Auth/ModuleFactory.ts";
import { EnvConfig } from '@Infrastructure/Core/Config.ts'

export class CreateModuleHandler {
  private repo = new ModuleRepository();
  private static readonly DEFAULT_CREATED_BY = EnvConfig.admin.superRoot;

  async execute(command: CreateModuleCommand) {
    const tx = await sequelize.transaction();

    try {
      const domainModule = buildModule({
        ...command.params,
        createdBy:
          command.params.createdBy ??
          CreateModuleHandler.DEFAULT_CREATED_BY,
      });

      const savedModule = await this.repo.save(domainModule, tx);

      await tx.commit();
      return savedModule;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }
}
