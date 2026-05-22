// ===================================================================
// 🟢 src/01-Api/Routes/UserRoutes.ts
// ===================================================================

import { Router } from "express";
import { UserController } from "../Controllers/Base/UserController.ts";
// import { GetUserRepository } from "#Infrastructure/Dependencies/UserRepoProvider.ts"
import { routeHandler } from "#Api/Helpers/RouteHandlerFactory.ts";

export const UserRoute = Router()
UserRoute.post("/info", routeHandler(UserController, "userInfo"));
UserRoute.get("/search", routeHandler(UserController, "searchUsers"));
UserRoute.get("/", routeHandler(UserController, "listUsers"));
UserRoute.get("/:userId", routeHandler(UserController, "getUserDetail"));
UserRoute.post("/", routeHandler(UserController, "createUser"));
UserRoute.put("/:userId", routeHandler(UserController, "updateUser"));
UserRoute.delete("/:userId", routeHandler(UserController, "deleteUser"));
