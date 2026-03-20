// ===================================================================
// 🟢 src/01-Api/Routes/HomeRoutes.ts
// ===================================================================

import { Router } from "express";
import HomeController from "../Controllers/HomeController.ts";
import { routeHandler } from "@Api/Helpers/RouteHandlerFactory.ts";

export const HomeRoute = Router();

HomeRoute.get("/", routeHandler(HomeController, "index"));
HomeRoute.get("/health", routeHandler(HomeController, "health"));
HomeRoute.get("/generate-encrypted-client-id", routeHandler(HomeController, "generateEncryptedClientId"));
HomeRoute.post("/generate-decrypted-client-id", routeHandler(HomeController, "generateDecryptedClientId"));
