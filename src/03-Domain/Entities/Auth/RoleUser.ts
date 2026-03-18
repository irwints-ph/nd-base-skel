// ===========================================
// 🧩 Domain/Entities/Auth/RoleUser.ts
// ===========================================

export class RoleUser {
  public RoleId: number;
  public UserId: number;
  public CreatedBy: number;
  public IsActive: boolean;

  // ---------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------
  constructor(params: {
    roleId: number;
    userId: number;
    createdBy: number;
    isActive?: boolean;
  }) {
    this.RoleId = params.roleId;
    this.UserId = params.userId;
    this.CreatedBy = params.createdBy;
    this.IsActive = params.isActive ?? true;
  }

  // ---------------------------------------------------------
  // Domain Behaviors
  // ---------------------------------------------------------
  public deactivate(): void {
    this.IsActive = false;
  }
}
