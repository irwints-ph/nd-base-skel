// src/01-contracts/base/roles/RoleSchemas.ts

// ----------------------------
// Role creation DTO
// ----------------------------
export interface RoleCreate {
  roleId: number;
  roleName: string;
  roleDescription: string;
  parentId?: number | null;
  createdBy: number;
  isActive?: boolean; // default true
  isAdmin?: boolean;  // default false
}

// ----------------------------
// Role flat/base DTO
// ----------------------------
export interface RoleFlatBase {
  roleId: number;
  roleName: string;
  roleDescription: string;
  parentId?: number | null;
  isActive: boolean;
  isAdmin: boolean;
}

// ----------------------------
// Role update DTO
// ----------------------------
export interface RoleUpdate {
  roleId: number;
  roleName?: string | null;
  roleDescription?: string | null;
  parentId?: number | null;
  updatedBy?: number;
  isActive?: boolean;
  isAdmin?: boolean;
}
