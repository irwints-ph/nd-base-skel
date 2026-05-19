// ===================================================================
// 🟢 App/Api/Controllers/Base/AuthController.ts
// ===================================================================
import { Router, Request, Response } from "express";
// import { body, query, validationResult } from "express-validator";

import { JwtTokenService } from "@Infrastructure/Auth/JwtTokenService.ts";
import { authenticateUser } from "@Infrastructure/Auth/JwtAuthService.ts";
import { GetDbAsync } from "@Infrastructure/Persistence/Dependencies/db.ts";
// import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts";

import RegisterUserHandler from "@Application/Handlers/Base/RegisterUserHandler.ts";
import { CreateUserHandler }  from "@Application/Handlers/Base/CreateUserHandler.ts";
import { CreateOlUserHandler } from "@Application/Handlers/Base/CreateOlUserHandler.ts";
import { VerifyEmailHandler } from "@Application/Handlers/Auth/VerifyEmailHandler.ts";

// import {
//   RegisterUserCommand,
//   VerifyEmailCommand,
//   CreateUserCommand,
//   CreateOlUserCommand,
// } from "@Application/Commands/Base/index.ts";

import {
  Token,
  TokenData,
  UserRegister,
  // UserCreateSchema,
  // UserCreateFromSso,
  // UserActivationRequest,
} from "@Contracts/Auth/LoginSchema.ts";

const AuthRoute = Router();

// -------------------------------------------------------------------
// 🔑 LOGIN
// -------------------------------------------------------------------
AuthRoute.post("/token", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if(!username){
    return res.json({
      success: false,
      message: "no credentials given",
    });

  }
  console.log("called GetDbAsync AuthController")
  const db = await GetDbAsync();
  // const userRepo = GetUserRepository();

  const user = await authenticateUser(username, password, db);

  if (!user) {
    return res.json({
      success: false,
      message: "Incorrect credentials or user not yet verified",
    });
  }

  const issuer = req.baseUrl.replace(/\/$/, "");
  const localIssuer = `${req.protocol}://${req.get("host")}`;

  return res.json({
      success: true,
      accessToken: JwtTokenService.createAccessToken(user, localIssuer),
    });
});

// // -------------------------------------------------------------------
// // 📝 USER REGISTRATION / ACTIVATION
// // -------------------------------------------------------------------
// AuthRoute.post("/activate", async (req: Request, res: Response) => {
//   const user: UserRegister = req.body;
//   const repo = GetUserRepository();

//   const issuer = user.feserver ?? `${req.baseUrl.replace(/\/$/, "")}/api`;

//   const handler = new RegisterUserHandler(() => repo);
//   const cmd = new RegisterUserCommand({ user, issuer });

//   const result = await handler.handle(cmd);
//   return res.json(result);
// });

// // -------------------------------------------------------------------
// // 🔐 VERIFY EMAIL
// // -------------------------------------------------------------------
// AuthRoute.get("/verify", async (req: Request, res: Response) => {
//   const token = req.query.token as string;
//   const passwd = req.query.passwd as string | undefined;
//   const repo = GetUserRepository();

//   const handler = new VerifyEmailHandler(() => repo);
//   const cmd = new VerifyEmailCommand({ token, passwd });

//   const result = await handler.handle(cmd);
//   return res.json(result);
// });

// AuthRoute.post("/verify", async (req: Request, res: Response) => {
//   const request: TokenData = req.body;
//   const repo = GetUserRepository();

//   const handler = new VerifyEmailHandler(() => repo);
//   const cmd = new VerifyEmailCommand({
//     token: request.token,
//     passwd: request.passwd,
//   });

//   const result = await handler.handle(cmd);
//   return res.json(result);
// });

// // -------------------------------------------------------------------
// // 👤 REGISTER USER (Standard)
// // -------------------------------------------------------------------
// AuthRoute.post("/register", async (req: Request, res: Response) => {
//   const userIn: UserCreateSchema = req.body;
//   const createdBy = 1;
//   const repo = GetUserRepository();

//   const handler = new CreateUserHandler(() => repo);
//   const cmd = new CreateUserCommand({ user: userIn, created_by: createdBy });

//   const result = await handler.handle(cmd);
//   return res.json(result);
// });

// // -------------------------------------------------------------------
// // 👤 REGISTER OL USER (SSO)
// // -------------------------------------------------------------------
// AuthRoute.post("/register-ol-user", async (req: Request, res: Response) => {
//   const userIn: UserCreateFromSso = req.body;
//   const createdBy = 1;
//   const repo = GetUserRepository();

//   const handler = new CreateOlUserHandler(() => repo);
//   const cmd = new CreateOlUserCommand({ user: userIn, created_by: createdBy });

//   const result = await handler.handle(cmd);
//   return res.json(result);
// });

// // -------------------------------------------------------------------
// // 🔑 FORGOT PASSWORD
// // -------------------------------------------------------------------
// AuthRoute.post("/forgot-password", async (req: Request, res: Response) => {
//   const user: UserActivationRequest = req.body;

//   return res.json({
//     success: true,
//     message: "User activation request received",
//     data: user,
//   });
// });

export default AuthRoute;