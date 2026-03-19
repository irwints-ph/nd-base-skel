// ===================================================================
// 🖥️ src/01-Api/Controllers/Base/RolesController.ts
// ===================================================================

import { Request, Response } from "express";
import { BaseApiController } from "../BaseApiController.ts";
import { IRoleRepository } from "@Domain/Interfaces/Auth/IRoleRepository.ts";

import { RoleServiceQuery } from "@Application/Queries/Auth/RoleServiceQuery.ts";
// import { CreateRoleCommand } from "@Application/Commands/Auth/Roles/CreateRoleCommand.ts";
// import { UpdateRoleCommand } from "@Application/Commands/Auth/Roles/UpdateRoleCommand.ts";
// import { DeleteRoleCommand } from "@Application/Commands/Auth/Roles/DeleteRoleCommand.ts";

// import { CreateRoleHandler } from "@Application/Handlers/Auth/Roles/CreateRoleHandler.ts";
// import { UpdateRoleHandler } from "@Application/Handlers/Auth/Roles/UpdateRoleHandler.ts";
// import { DeleteRoleHandler } from "@Application/Handlers/Auth/Roles/DeleteRoleHandler.ts";
import { IUserRepository } from "@Domain/Interfaces/Base/IUserRepository.ts";
const roleQueryService = new RoleServiceQuery();

export class RolesController extends BaseApiController {
  constructor(repo: IUserRepository) {
    super(repo);
  }

  // async searchRoles(req: Request, res: Response) {
  //   const { search = "" } = req.query;
  //   const result = await roleQueryService.listRoles({ page: 1, pageSize: 10, search: String(search) });
  //   return this.successBase(res, result.items, req);
  // }

  async getRoleDetail(req: Request, res: Response) {
    const roleId = Number(req.params.roleId);
    const currentUser = await this.getCurrentUser(req);

    const role = await roleQueryService.getRole(roleId);
    if (!role) return this.error(res, "Role not found", 404);

    return this.success(res, role);
  }

  // async updateRole(req: Request, res: Response) {
  //   const currentUser = await this.getCurrentUser(req);
  //   const cmd: UpdateRoleCommand = {
  //     roleId: Number(req.params.id),
  //     payload: req.body,
  //     updatedBy: currentUser.userId,
  //     updatedName: currentUser.fullname,
  //   };

  //   const handler = new UpdateRoleHandler(() => this.repo);
  //   const result = await handler.handle(cmd);
  //   return this.success(res, result);
  // }

  // async deleteRole(req: Request, res: Response) {
  //   const currentUser = await this.getCurrentUser(req);
  //   const cmd: DeleteRoleCommand = {
  //     id: Number(req.params.id),
  //     deletedBy: currentUser.userId,
  //     deletedName: currentUser.fullname,
  //   };

  //   const handler = new DeleteRoleHandler(() => this.repo);
  //   const result = await handler.handle(cmd);
  //   return this.successBase(res, result);
  // }

  // async getRoles(req: Request, res: Response) {
  //   const { page = 1, limit = 10, search = "", column = "", sortBy = "", descending = false } = req.query;

  //   const result = await roleQueryService.listRoles({
  //     page: Number(page),
  //     pageSize: Number(limit),
  //     search: String(search),
  //     column: String(column),
  //     sortBy: String(sortBy),
  //     descending: Boolean(descending),
  //   });

  //   return this.success(res, result);
  // }

  // async createRole(req: Request, res: Response) {
  //   const currentUser = await this.getCurrentUser(req);
  //   const cmd: CreateRoleCommand = {
  //     payload: req.body,
  //     createdBy: currentUser.userId,
  //     createdName: currentUser.fullname,
  //   };

  //   const handler = new CreateRoleHandler(() => this.repo);
  //   const result = await handler.handle(cmd);
  //   return this.success(res, result, "Role created");
  // }
}
