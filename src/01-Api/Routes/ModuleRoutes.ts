// ===================================================================
// 🟢 src/01-Api/Routes/ModuleRoute.ts
// ===================================================================

import { Router } from "express";
import { ModuleController } from "../Controllers/Base/ModuleController.ts";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts"
import { routeHandler } from "@Api/Helpers/RouteHandlerFactory.ts";

export const ModuleRoute = Router()
ModuleRoute.get("/routes", routeHandler(ModuleController, GetUserRepository, "getRoutes"));
