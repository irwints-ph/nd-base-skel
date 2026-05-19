// src/Application/Handlers/Auth/CreateModuleHandler.ts
import { ModuleRepository } from "@Infrastructure/Persistence/Repositories/Auth/ModuleRepository.ts";
import { sequelize } from "@Infrastructure/Persistence/AppDBContext.ts";
import { buildModule } from "@Application/Services/Auth/ModuleFactory.ts";
import { CreateModuleCommand } from "../CreateModuleCommandParams.ts";
import { EnvConfig } from '@Infrastructure/Core/Config.ts'

export class CreateModuleHandler {
  private repo = new ModuleRepository();
  private static readonly DEFAULT_CREATED_BY = EnvConfig.admin.superRoot;

  async execute(command: CreateModuleCommand) {
    console.log("sequelize.transaction in BuildModuleService");
    const tx = await sequelize.transaction();
    try {
      // 1️⃣ Build domain module
      const domainModule = buildModule({
        ...command.params,
        createdBy:
          command.params.createdBy ??
          CreateModuleHandler.DEFAULT_CREATED_BY,
      });

      // 2️⃣ Save via repository
      const savedModule = await this.repo.save(domainModule, tx);

      // 3️⃣ Commit
      await tx.commit();

      return savedModule;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }
}
