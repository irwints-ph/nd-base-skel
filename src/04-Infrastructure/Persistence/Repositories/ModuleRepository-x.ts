// ===================================================================
// 🧩 src/04-Infrastructure/Persistence/Repositories/ModuleRepository.ts
// ===================================================================

import { IModuleRepository } from "#Domain/Interfaces/Auth/IModuleRepository.ts";
import { Module } from "#Domain/Entities/Auth/Module.ts";
import { ModuleMapper } from "../Mappers/Auth/ModuleMapper.ts";
import { sequelize } from "../AppDBContext.ts";
import ModuleMstr from "../Models/Auth/ModuleMstr.ts";

export class ModuleRepositoryX {
  async save(module: Module, transaction?: any): Promise<Module> {
    // const data = ModuleMapper.toOrmPlain(module);
    // const orm = await ModuleMstr.create(data, { transaction });
    // // Rehydrate identity
    // module.ModuleId = orm.ModuleId;
    // return module;

    // Map domain → ORM
    const ormData = ModuleMapper.toOrm(module);

    // Save with optional transaction
    await ormData.save({ transaction });

    // Optionally rehydrate the domain entity with the DB-generated ID
    module.ModuleId = ormData.ModuleId;

    return module;
  }  
  async save_x(data: Module): Promise<Module> {
    console.log("ModuleRepository-x in BuildModuleService");
    const tx = await sequelize.transaction();

    try {
      // 1️⃣ Map Domain → ORM
      const ormData = ModuleMapper.toOrm(data);

      // 2️⃣ Save root
      await ormData.save({ transaction: tx });

      await tx.commit();
      return data;

      // // 5️⃣ Rehydrate domain user with identity
      // return data.withId(ormData.ModuleId);

    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }
}
