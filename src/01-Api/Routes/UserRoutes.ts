// ===================================================================
// 🟢 App/Api/Routes/UserRoutes.ts
// ===================================================================

import { Router } from "express";
import { UserController } from "../Controllers/Base/UserController.ts";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts"
import { routeHandler } from "@Api/Helpers/RouteHandlerFactory.ts";

export const UserRoute = Router()
UserRoute.post("/info", routeHandler(UserController, GetUserRepository, "userInfo"));
UserRoute.get("/search", routeHandler(UserController, GetUserRepository, "searchUsers"));
UserRoute.get("/", routeHandler(UserController, GetUserRepository, "listUsers"));
UserRoute.get("/:userId", routeHandler(UserController, GetUserRepository, "getUserDetail"));
UserRoute.post("/", routeHandler(UserController, GetUserRepository, "createUser"));
UserRoute.put("/:userId", routeHandler(UserController, GetUserRepository, "updateUser"));
UserRoute.delete("/:userId", routeHandler(UserController, GetUserRepository, "deleteUser"));
