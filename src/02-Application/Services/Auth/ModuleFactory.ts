// =========================================================
// 🧩 App/Application/Services/Auth/ModuleFactory.ts
// =========================================================

import { Module } from "#Domain/Entities/Auth/Module.ts";
import { AppTime } from "#Infrastructure/Core/AppTime.ts";

export interface BuildModuleParams {
  moduleId: number;
  moduleName: string;
  createdBy: number;
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
}

export function buildModule(params: BuildModuleParams): Module {
  const {
    moduleId,
    moduleName,
    createdBy,
    parentId,
    menuLevel = 0,
    sortOrder = 0,
    iconClass = '',
    componentName = '',
    controllerName = '',
    feUrl = '',
    isParent = false,
    isCrud = false,
    editComponent = '',
    addComponent = '',
    tranCode,
    isAdmin = false,
    isActive = true,
  } = params;

  return new Module({
    moduleId,
    moduleName,
    parentId,
    menuLevel,
    sortOrder,
    iconClass,
    componentName,
    controllerName,
    feUrl,
    isParent,
    isCrud,
    editComponent,
    addComponent,
    tranCode,
    isAdmin,
    isActive,
    createdBy,
    createdOn: AppTime.utcNow(),
  });
}
