// src/Application/Commands/Auth/CreateModuleCommand.ts
import { Module } from "#Domain/Entities/Auth/Module.ts";

export interface CreateModuleCommandParams {
  moduleId: number;
  moduleName: string;
  parentId?: number;
  menuLevel?: number;
  sortOrder?: number;
  iconClass?: string;
  componentName?: string;
  controllerName?: string;
  feUrl?: string;
  isParent?: boolean;
  isCrud?: boolean;
  editComponent?: string;
  addComponent?: string;
  tranCode?: string;
  isAdmin?: boolean;
  isActive?: boolean;
  createdBy?: number;
}

export class CreateModuleCommand {
  constructor(public readonly params: CreateModuleCommandParams) {}
}
