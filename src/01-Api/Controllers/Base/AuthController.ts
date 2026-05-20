// ===================================================================
// 🧩 App/Api/Controllers/Base/AuthRoute.ts (Express version)
// ===================================================================

import { Router, Request, Response } from "express";

import { GetUserRepository } from "@Infrastructure/Dependencies/UserRepoProvider.ts";
import { getEmailSender } from "@Infrastructure/Dependencies/EmailSender.ts";

import { JwtTokenService } from "@Infrastructure/Auth/JwtTokenService.ts";
import { authenticateUser } from "@Infrastructure/Auth/JwtAuthService.ts";
import { GetDbAsync } from "@Infrastructure/Persistence/Dependencies/db.ts";

import { CreateUserHandler } from "@Application/Handlers/Base/CreateUserHandler.ts";
import { VerifyEmailHandler } from "@Application/Handlers/Auth/VerifyEmailHandler.ts";

const AuthRoute = Router();

// -------------------------------------------------------------------
// 🔑 TOKEN LOGIN (already existing style)
// -------------------------------------------------------------------
AuthRoute.post("/token", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username) {
      return res.json({
        success: false,
        message: "no credentials given",
      });
    }

    const db = await GetDbAsync();

    const user = await authenticateUser(username, password, db);

    if (!user) {
      return res.json({
        success: false,
        message: "Incorrect credentials or user not yet verified",
      });
    }

    const localIssuer = `${req.protocol}://${req.get("host")}`;

    return res.json({
      success: true,
      accessToken: JwtTokenService.createAccessToken(user, localIssuer),
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// -------------------------------------------------------------------
// 📝 USER ACTIVATION (POST /activate)
// -------------------------------------------------------------------
AuthRoute.post("/activate", async (req: Request, res: Response) => {
  try {
    const repo = GetUserRepository();
    const emailSender = getEmailSender();

    const handler = new CreateUserHandler();

    const result = await handler.handle({
      ...req.body,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});


// // -------------------------------------------------------------------
// // 🔐 VERIFY EMAIL (GET /verify)
// // -------------------------------------------------------------------
// AuthRoute.get("/verify", async (req: Request, res: Response) => {
//   try {
//     const { token, passwd } = req.query;

//     const handler = new VerifyEmailHandler();

//     const result = await handler.verifyEmailGet(
//       String(token),
//       passwd ? String(passwd) : undefined
//     );

//     return res.json(result);
//   } catch (err: any) {
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });


// // -------------------------------------------------------------------
// // 🔐 VERIFY EMAIL (POST /verify)
// // -------------------------------------------------------------------
// AuthRoute.post("/verify", async (req: Request, res: Response) => {
//   try {
//     const handler = new VerifyEmailHandler();

//     const result = await handler.verifyEmailPost(req.body);

//     return res.json(result);
//   } catch (err: any) {
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });


// // -------------------------------------------------------------------
// // 🔑 FORGOT PASSWORD (POST /forgot-password)
// // -------------------------------------------------------------------
// AuthRoute.post("/forgot-password", async (req: Request, res: Response) => {
//   try {
//     const repo = GetUserRepository();
//     const emailSender = getEmailSender();

//     const handler = new CreateUserHandler(); // or ForgotPasswordHandler if split

//     const result = await handler.handleForgotPassword({
//       ...req.body,
//     });

//     return res.json(result);
//   } catch (err: any) {
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });


// // -------------------------------------------------------------------
// // 🔐 VERIFY FORGOT PASSWORD (GET)
// // -------------------------------------------------------------------
// AuthRoute.get("/verify-forgot", async (req: Request, res: Response) => {
//   try {
//     const { token } = req.query;

//     const handler = new VerifyEmailHandler();

//     const result = await handler.verifyForgot({
//       token: String(token),
//     });

//     return res.json(result);
//   } catch (err: any) {
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });


// // -------------------------------------------------------------------
// // 🔐 VERIFY FORGOT PASSWORD (POST)
// // -------------------------------------------------------------------
// AuthRoute.post("/verify-forgot", async (req: Request, res: Response) => {
//   try {
//     const handler = new VerifyEmailHandler();

//     const result = await handler.verifyForgot(req.body);

//     return res.json(result);
//   } catch (err: any) {
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });


// // -------------------------------------------------------------------
// // 🔑 PASSWORD POLICY UI
// // -------------------------------------------------------------------
// AuthRoute.get("/password-policy-ui", async (_req: Request, res: Response) => {
//   try {
//     const handler = new CreateUserHandler();

//     const result = await handler.getPasswordPolicyUi?.();

//     return res.json(result ?? {});
//   } catch (err: any) {
//     return res.status(400).json({
//       success: false,
//       message: err.message,
//     });
//   }
// });

export default AuthRoute;