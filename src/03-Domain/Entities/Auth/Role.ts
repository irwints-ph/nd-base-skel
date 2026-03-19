// ===========================================
// 🧩 Domain/Entities/Auth/Role.ts
// ===========================================
import { AppTime } from "@Infrastructure/Core/AppTime.ts";

export class Role {
  public RoleId?: number;
  public RoleName: string;
  public RoleDescription: string;
  public ParentId?: number | null;
  public CreatedBy: number;
  public IsAdmin: boolean;
  public IsActive: boolean;
  public UpdatedBy?: number| null;
  public UpdatedOn?: Date| null;

  // ---------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------
  constructor(params: {
    roleName: string;
    roleDescription: string;
    parentId?: number;
    createdBy: number;
    isAdmin?: boolean;
    isActive?: boolean;
    updatedBy?: number| null;
    updatedOn?: Date| null;
    roleId?: number;
  }) {
    this.RoleId = params.roleId;
    this.RoleName = params.roleName;
    this.RoleDescription = params.roleDescription;
    this.ParentId = params.parentId;
    this.CreatedBy = params.createdBy;
    this.IsAdmin = params.isAdmin ?? false;
    this.IsActive = params.isActive ?? true;
    this.UpdatedBy = params.updatedBy;
    this.UpdatedOn = params.updatedOn;
  }

  // ---------------------------------------------------------
  // Domain Behaviors
  // ---------------------------------------------------------
  public activate(updatedBy: number): void {
    this.IsActive = true;
    this.UpdatedBy = updatedBy;
  }

  public deactivate(updatedBy: number): void {
    if (this.IsAdmin) {
      throw new Error("Admin roles cannot be deactivated");
    }
    this.IsActive = false;
    this.UpdatedBy = updatedBy;
  }

  public updateDetails(params: {
    roleName?: string;
    roleDescription?: string;
    parentId?: number | null;
    updatedBy: number;
    isAdmin?: boolean;
    isActive?: boolean;
  }): void {
    if (this.IsAdmin) {
      throw new Error("Admin roles cannot be edited");
    }

    if (params.roleName) {
      this.RoleName = params.roleName.trim();
    }
    if (params.roleDescription) {
      this.RoleDescription = params.roleDescription.trim();
    }
    if (params.parentId !== undefined) {
      this.ParentId = params.parentId;
    }
    if (params.isAdmin !== undefined) {
      this.IsAdmin = params.isAdmin;
    }
    if (params.isActive !== undefined) {
      this.IsActive = params.isActive;
    }

    this.UpdatedBy = params.updatedBy;
    this.UpdatedOn = new Date();

  }
}
