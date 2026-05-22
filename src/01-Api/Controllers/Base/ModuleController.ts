// src/api/controllers/base/ModulesController.ts
import { Request, Response, Router } from "express";

import { BaseApiController } from "../BaseApiController.ts";
import { IUserRepository } from "#Domain/Interfaces/Base/IUserRepository.ts";
import { ModuleServiceQuery } from "#Application/Queries/Auth/ModuleServiceQuery.ts";
// import { CreateModuleCommand } from "#Application/Commands/Auth/Modules/CreateModuleCommand.ts";
// import { UpdateModuleCommand } from "#Application/Commands/Auth/Modules/UpdateModuleCommand.ts";
// import { DeleteModuleCommand } from "#Application/Commands/Auth/Modules/DeleteModuleCommand.ts";
// import { CreateModuleHandler } from "#Application/Handlers/Auth//Modules/CreateModuleHandler.ts";
// import { UpdateModuleHandler } from "#Application/Handlers/Auth//Modules/UpdateModuleHandler.ts";
// import { DeleteModuleHandler } from "#Application/Handlers/Auth//Modules/DeleteModuleHandler.ts";

// import { ModuleRepository } from "#Infrastructure/Persistence/Repositories/Auth/ModuleRepository.ts";

// const router = Router();

// const moduleRepo = new ModuleRepository();
const moduleQueryService = new ModuleServiceQuery();
export class ModuleController extends BaseApiController {
  constructor(
    // logger: Logger<ILogObj>,
    userRepo: IUserRepository
  ) {
    super(userRepo);
  }
  // -----------------------------
  // GET USER ROUTES
  // -----------------------------
  async getRoutes(req: Request, res: Response) {
    // const currentUser = await this.getCurrentUser(req)
    const currentUser = (req as any).currentUser;
    if(!currentUser){
      return this.error(res, "Not Login");
    }
    const theRoutes = await moduleQueryService.getRoutes(currentUser);
    return this.success(res,theRoutes);
  }

  async searchModules(req: Request, res: Response) {
    const { search = "" } = req.query;
    const result = await moduleQueryService.listModules(
      1, //page: 
      10, // pageSize: 
      String(search) // search: 
      );
    return res.json({ success: true, data: result.items });
  }

  async getModules(req: Request, res: Response) {
    const { page = 1, limit = 10, search = "", column = "", sortBy = "", descending = false } = req.query;

    const result = await moduleQueryService.listModules(
      Number(page),           //page: 
      Number(limit),          //pageSize: 
      String(search),         //search: 
      String(column),         //column: 
      String(sortBy),         //sortBy: 
      Boolean(descending),    //descending: 
    );
    //return res.json({ success: true, data: result });
    return this.success(res, result);
  }

  async getModuleDetail(req: Request, res: Response) {
    const moduleId = Number(req.params.moduleId);
    // const currentUser = await this.getCurrentUser(req);

    const role = await moduleQueryService.getModule(moduleId);
    if (!role) return this.error(res, "Role not found", 404);

    return this.success(res, role);
  }

}

// export default router;
