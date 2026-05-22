// src/Domain/Repositories/IModuleRepository.ts
// src/domain/interfaces/auth/IModuleRepository.ts
import ModuleMstr from "#Infrastructure/Persistence/Models/Auth/ModuleMstr.ts";
import { Transaction } from "sequelize";

export interface IModuleRepository {
  // ---------- QUERIES ----------
  getByIdOrm(moduleId: number): Promise<ModuleMstr | null>;
  getByName(moduleName: string): Promise<ModuleMstr | null>;
  listAll(): Promise<ModuleMstr[]>;
  getUserAccessibleModules(userId: number): Promise<[ModuleMstr, string][]>;

  // ---------- COMMANDS ----------
  create(
    name: string,
    feUrl: string,
    isActive: boolean,
    isCrud: boolean,
    createdBy: number,
    parentId?: number
  ): Promise<ModuleMstr>;

  delete(module: ModuleMstr): Promise<void>;
}
