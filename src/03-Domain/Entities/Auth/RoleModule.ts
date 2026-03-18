// ===========================================
// 🧩 Domain/Entities/Auth/RoleModule.ts
// ===========================================

export class RoleModule {
  public RoleId: number;
  public ModuleId: number;
  public Authorization: string;
  public IsActive: boolean;
  public CreatedBy: number;

  // ---------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------
  constructor(params: {
    roleId: number;
    moduleId: number;
    createdBy: number;
    authorization?: string;
    isActive?: boolean;
  }) {
    const auth = params.authorization ?? "YYYYY";

    if (!auth || auth.length !== 5) {
      throw new Error("Authorization must be exactly 5 characters");
    }

    this.RoleId = params.roleId;
    this.ModuleId = params.moduleId;
    this.Authorization = auth;
    this.IsActive = params.isActive ?? true;
    this.CreatedBy = params.createdBy;
  }

  // ---------------------------------------------------------
  // Domain Behaviors
  // ---------------------------------------------------------
  public updateAuthorization(newAuth: string): void {
    if (!newAuth || newAuth.length !== 5) {
      throw new Error("Authorization must be exactly 5 characters");
    }
    this.Authorization = newAuth;
  }

  public deactivate(): void {
    this.IsActive = false;
  }
}
