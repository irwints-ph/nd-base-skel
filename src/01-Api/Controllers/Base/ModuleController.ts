// src/api/controllers/base/ModulesController.ts
import { Request, Response, Router } from "express";
import { ModuleRepository } from "@Infrastructure/Persistence/Repositories/Auth/ModuleRepository.ts";

import { BaseApiController } from "../BaseApiController.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";

// import { CreateModuleCommand } from "@Application/Commands/Auth/Modules/CreateModuleCommand.ts";
// import { UpdateModuleCommand } from "@Application/Commands/Auth/Modules/UpdateModuleCommand.ts";
// import { DeleteModuleCommand } from "@Application/Commands/Auth/Modules/DeleteModuleCommand.ts";
// import { CreateModuleHandler } from "@Application/Handlers/Auth//Modules/CreateModuleHandler.ts";
// import { UpdateModuleHandler } from "@Application/Handlers/Auth//Modules/UpdateModuleHandler.ts";
// import { DeleteModuleHandler } from "@Application/Handlers/Auth//Modules/DeleteModuleHandler.ts";
// import { ModuleServiceQuery } from "@Application/Queries/Auth/ModuleServiceQuery.ts";

const router = Router();
// const baseController = new BaseApiController();
const moduleRepo = new ModuleRepository();
// const moduleQueryService = new ModuleServiceQuery();
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
    const currentUser = await this.getCurrentUser(req)
    if(!currentUser){
      return this.error(res, "Not Login");
    }
    const modulesWithPermissions = await moduleRepo.getUserAccessibleModules(currentUser?.userId ?? -1);

    const routes: string[] = [];
    for (const [module, auth] of modulesWithPermissions) {
      if (!module.IsActive) continue;

      routes.push(module.FeUrl);

      if (module.IsCrud) {
        if (auth[1] === "Y") routes.push(`${module.FeUrl}/add`);
        if (auth[2] === "Y") routes.push(`${module.FeUrl}/edit/:id`);
        if (auth[0] === "Y") routes.push(`${module.FeUrl}/view/:id`);
      }
    }
    return this.success(res,[...new Set(routes)].sort())
  }


}
// // -----------------------------
// // LIST MODULES
// // -----------------------------
// router.get("/", async (req: Request, res: Response) => {
//   const { page = 1, limit = 10, search = "", column = "", sortBy = "", descending = false } = req.query;

//   const result = await moduleQueryService.listModules({
//     page: Number(page),
//     pageSize: Number(limit),
//     search: String(search),
//     column: String(column),
//     sortBy: String(sortBy),
//     descending: Boolean(descending),
//   });

//   return res.json(baseController.success(result, req));
// });

// // -----------------------------
// // SEARCH MODULES
// // -----------------------------
// router.get("/search", async (req: Request, res: Response) => {
//   const { search = "" } = req.query;

//   const result = await moduleQueryService.listModules({
//     page: 1,
//     pageSize: 10,
//     search: String(search),
//   });

//   return res.json(baseController.successBase(result.items));
// });


// // -----------------------------
// // GET MODULE BY ID
// // -----------------------------
// router.get("/:moduleId", async (req: Request, res: Response) => {
//   const moduleId = Number(req.params.moduleId);
//   await baseController.requireCurrentUser(req);

//   const module = await moduleQueryService.getModule(moduleId);

//   if (!module) {
//     return res.status(404).json({ detail: "Module not found" });
//   }

//   return res.json(baseController.success(module));
// });

// // -----------------------------
// // CREATE MODULE
// // -----------------------------
// router.post("/", async (req: Request, res: Response) => {
//   const currentUser = await baseController.requireCurrentUser(req);

//   const cmd = new CreateModuleCommand({
//     moduleName: req.body.module_name,
//     feUrl: req.body.fe_url,
//     isActive: req.body.is_active,
//     isCrud: req.body.is_crud,
//     createdBy: currentUser.userId,
//     createdName: currentUser.fullname,
//   });

//   const handler = new CreateModuleHandler(() => moduleRepo);
//   const result = await handler.handle(cmd);

//   return res.status(201).json(baseController.success(result));
// });

// // -----------------------------
// // UPDATE MODULE
// // -----------------------------
// router.put("/:id", async (req: Request, res: Response) => {
//   const currentUser = await baseController.requireCurrentUser(req);

//   const cmd = new UpdateModuleCommand({
//     moduleId: Number(req.params.id),
//     moduleName: req.body.module_name,
//     feUrl: req.body.fe_url,
//     isActive: req.body.is_active,
//     isCrud: req.body.is_crud,
//     updatedBy: currentUser.userId,
//     updatedName: currentUser.fullname,
//   });

//   const handler = new UpdateModuleHandler(() => moduleRepo);
//   const result = await handler.handle(cmd);

//   return res.json(baseController.success(result));
// });

// // -----------------------------
// // DELETE MODULE
// // -----------------------------
// router.delete("/:id", async (req: Request, res: Response) => {
//   const currentUser = await baseController.requireCurrentUser(req);

//   const cmd = new DeleteModuleCommand({
//     moduleId: Number(req.params.id),
//     deletedBy: currentUser.userId,
//     deletedName: currentUser.fullname,
//   });

//   const handler = new DeleteModuleHandler(() => moduleRepo);
//   const result = await handler.handle(cmd);

//   return res.json(baseController.successBase(result));
// });

export default router;
