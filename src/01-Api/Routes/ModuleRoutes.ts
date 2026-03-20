// ===================================================================
// 🟢 src/01-Api/Routes/ModuleRoute.ts
// ===================================================================

import { Router } from "express";
import { ModuleController } from "../Controllers/Base/ModuleController.ts";
import { routeHandler } from "@Api/Helpers/RouteHandlerFactory.ts";

export const ModuleRoute = Router()
ModuleRoute.get("/routes", routeHandler(ModuleController, "getRoutes"));
ModuleRoute.get("/search", routeHandler(ModuleController, "searchModules"));
ModuleRoute.get("/", routeHandler(ModuleController, "getModules"));
ModuleRoute.get("/:moduleId", routeHandler(ModuleController, "getModuleDetail"));
