// ===================================================================
// 🖥️ src/01-Api/Controllers/Base/UserController.ts
// ===================================================================
import { Request, Response } from "express";
import { BaseApiController } from "../BaseApiController.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";

import { CreateUserCommand } from "@Application/Commands/Base/Users/CreateUserCommand.ts";
import { UpdateUserCommand } from "@Application/Commands/Base/Users/UpdateUserCommand.ts";
import { DeleteUserCommand } from "@Application/Commands/Base/Users/DeleteUserCommand.ts";

import { CreateUserHandler } from "@Application/Handlers/Base/CreateUserHandler.ts";
import { UpdateUserHandler } from "@Application/Handlers/Base/UpdateUserHandler.ts";
import { DeleteUserHandler } from "@Application/Handlers/Base/DeleteUserHandler.ts";

import { UserQueryService } from "@Application/Queries/Base/UserQueryService.ts";
import { getActiveUser } from "@Infrastructure/Auth/RequestUtils.ts";

const userService = new UserQueryService();

export class UserController extends BaseApiController {
  constructor(
    // logger: Logger<ILogObj>,
    userRepo: IUserRepository
  ) {
    super(userRepo);
  }

  // GET /info
  async userInfo(req: Request, res: Response) {    
    // const currentUser = await this.getCurrentUser(req)
    const currentUser = (req as any).currentUser; 
    if(currentUser)
      return res.json({ success: true, data: currentUser });
    else {
      const currentUser = getActiveUser(req);
      if(currentUser) return res.json({ success: true, data: currentUser });
      else return this.error(res,"User Information not found");
    }
  }

  // GET /search
  async searchUsers(req: Request, res: Response) {
    const { search } = req.query;
    const result = await userService.listUsers(
      1,
      10,
      (search as string),
    );
    return res.json({ success: true, data: result.items });
  }

  // GET /:userId
  async getUserDetail(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const user = await userService.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, data: user });
  }

  // GET /
  async listUsers(req: Request, res: Response) {
    const { page = 1, limit = 10, search, column, sortBy, descending } = req.query;
    const result = await userService.listUsers(
      Number(page),
      Number(limit),
      search as string,
      column as string,
      sortBy as string,
      descending === "true",
    );
    return res.json({ success: true, data: result });
  }

  // POST / → CREATE USER
  async createUser(req: Request, res: Response) {
    try {
      const userIn:CreateUserCommand = req.body;
      // const currentUser = await this.getCurrentUser(req)
      const currentUser = (req as any).currentUser;
      const localIssuer = `${req.protocol}://${req.get("host")}/api`;

      const cmd: CreateUserCommand = {
        username: userIn.username,
        password: userIn.password,
        firstname: userIn.firstname,
        lastname: userIn.lastname,
        fullname: userIn.firstname + ' ' + userIn.lastname, 
        createdBy: currentUser?.userId ?? -1,
        email: userIn.email || "",
        isEmailValidated: userIn.isEmailValidated || false,
        issuer: localIssuer,
        createdName: currentUser?.fullname ?? "system",
      };

      const handler = new CreateUserHandler();

      const flatUser = await handler.handle(cmd);
      return this.success(
        res,        
        flatUser,
        `Created user ${userIn.username}`
      )
      // return res.json({ success: true, data: flatUser });
    } catch (err: any) {
      return this.error(res, `Faild to create: ${err.message}`)
      // return res.status(400).json({ success: false, message: err.message });
    }
  } // End Create

  // PUT /:userId
  async updateUser(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    try {
      const userData = req.body;
      // const currentUser = await this.getCurrentUser(req)
      const currentUser = (req as any).currentUser;

      const cmd:UpdateUserCommand = {
        userId: userId,
        username: userData.username,
        password: userData.password,
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email || "",
        isEmailValidated: userData.isEmailValidated || false,
        updatedBy: currentUser?.userId ?? -1,
        updatedName: currentUser?.fullname ?? "",
      };

      const handler = new UpdateUserHandler();
      const result = await handler.handle(cmd);
      return this.success(
        res,        
        result,
        `Updated user ${userData.username} (${userId})`
      )

      // return res.json({ success: true, data: result });
    } catch (err: any) {
      return this.error(res, `Faild to update userid ${userId}: ${err.message}`)
    }
  }

  // DELETE /:userId
  async deleteUser(req: Request, res: Response) {
    const userId = Number(req.params.userId);

    try {
      // const currentUser = await this.getCurrentUser(req)
      const currentUser = (req as any).currentUser;
      if(currentUser?.userId == userId)
        return this.error(res, `Cannot delete own data`);
      const cmd:DeleteUserCommand = {
        userId:userId,
        deletedBy: currentUser?.userId ?? -1,
        deletedName: currentUser?.fullname ?? "",
      };

      const handler = new DeleteUserHandler();
      const result = await handler.handle(cmd);

      return this.success(
        res,        
        result,
        `Deleted user ${result?.username} (${userId})`
      )
      // return res.json({ success: true, data: result });
    } catch (err: any) {
      return this.error(res, `Faild to delete userid ${userId}: ${err.message}`)
    }
  }
}
