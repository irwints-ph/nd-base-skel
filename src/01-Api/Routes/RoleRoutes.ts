// ===================================================================
// 🟢 src/01-Api/Routes/RolesRoutes.ts
// ===================================================================
import { Router } from "express";
import { RolesController } from "#Api/Controllers/Base/RoleController.ts";
// import { GetUserRepository } from "#Infrastructure/Dependencies/UserRepoProvider.ts"
import { routeHandler } from "#Api/Helpers/RouteHandlerFactory.ts";

export const RoleRoute = Router();

// 🔹 Search roles
RoleRoute.get("/search", routeHandler(RolesController, "searchRoles"));
// 🔹 Get role detail
RoleRoute.get("/:roleId", routeHandler(RolesController, "getRoleDetail"));
// 🔹 Get roles (paginated)
RoleRoute.get("/", routeHandler(RolesController, "getRoles"));

// // 🔹 Create role
// RoleRoute.post("/", routeHandler(RolesController, "createRole"));

// // 🔹 Update role
// RoleRoute.put("/:id", routeHandler(RolesController, "updateRole"));

// // 🔹 Delete role
// RoleRoute.delete("/:id", routeHandler(RolesController, "deleteRole"));


