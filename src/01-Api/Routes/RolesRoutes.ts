// ===================================================================
// 🟢 src/01-Api/Routes/RolesRoutes.ts
// ===================================================================
import { Router } from "express";
import { RolesController } from "@Api/Controllers/Base/RoleController.ts";
import { GetRoleRepository } from "@Infrastructure/Dependencies/RoleRepoProvider.ts";
import { routeHandler } from "@Api/Helpers/RouteHandlerFactory.ts";

export const RoleRoute = Router();

// // 🔹 Search roles
// RoleRoute.get("/search", routeHandler(RolesController, GetRoleRepository, "searchRoles"));

// 🔹 Get role detail
RoleRoute.get("/:roleId", routeHandler(RolesController, GetRoleRepository, "getRoleDetail"));

// // 🔹 Update role
// RoleRoute.put("/:id", routeHandler(RolesController, GetRoleRepository, "updateRole"));

// // 🔹 Delete role
// RoleRoute.delete("/:id", routeHandler(RolesController, GetRoleRepository, "deleteRole"));

// // 🔹 Get roles (paginated)
// RoleRoute.get("/", routeHandler(RolesController, GetRoleRepository, "getRoles"));

// // 🔹 Create role
// RoleRoute.post("/", routeHandler(RolesController, GetRoleRepository, "createRole"));
