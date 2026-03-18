// file: api-node/src/01-contracts/base/modules/ModuleSchemas.ts

export interface ModuleFlatBase {
  moduleId: number
  moduleName: string
  parentId: number | null
  menuLevel: number
  sortOrder: number
  iconClass: string
  componentName: string
  controllerName: string
  feUrl: string
  isParent: boolean
  isCrud: boolean
  editComponent: string
  addComponent: string
  tranCode: string | null
  isAdmin: boolean
  isActive: boolean
  createdBy: number | null
  createdOn: Date | null
  updatedBy: number | null
  updatedOn: Date | null
}

export interface ModuleBaseAuthorization {
  module: any
  authorization: string
}
export interface ModuleAuthorization {
  authorization: string
  roleId: number
  moduleId: number
  moduleName: string
  parentId: number | null
  menuLevel: number
  componentName: string
  controllerName: string
  feUrl: string
  sortOrder: number
  isCrud: boolean
  editComponent: string
  tranCode: string | null
}

export interface ModuleCreate {
  ModuleName: string;
  FeUrl: string;
  IsCrud: boolean;
  IsActive: boolean;
  createdBy?: number;
  [key: string]: any; // Allow additional fields
}

export interface ModuleUpdate extends ModuleCreate {
  moduleId: number;
  updatedBy?: number;
}

export interface ModuleReturn {
  success: boolean;
  message?: string;
  data?: any;
}
