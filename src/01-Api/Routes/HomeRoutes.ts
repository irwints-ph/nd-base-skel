// ===================================================================
// 🟢 src/01-Api/Routes/HomeRoutes.ts
// ===================================================================

import { Router } from "express";
import HomeController from "../Controllers/HomeController.ts";
import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts"
import { routeHandler } from "@Api/Helpers/RouteHandlerFactory.ts";

export const HomeRoute = Router();

HomeRoute.get("/", routeHandler(HomeController, GetUserRepository, "index"));
HomeRoute.get("/health", routeHandler(HomeController, GetUserRepository, "health"));
HomeRoute.get("/generate-encrypted-client-id", routeHandler(HomeController, GetUserRepository, "generateEncryptedClientId"));
HomeRoute.post("/generate-decrypted-client-id", routeHandler(HomeController, GetUserRepository, "generateDecryptedClientId"));
