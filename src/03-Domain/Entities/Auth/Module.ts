// ===========================================
// 🧩 Domain/Entities/Auth/Module.ts
// ===========================================

export class Module {
  public ModuleId: number;
  public ModuleName: string;
  public ParentId?: number;
  public MenuLevel: number;
  public SortOrder: number;
  public IconClass: string;
  public ComponentName: string;
  public ControllerName: string;
  public FeUrl: string;
  public IsParent: boolean;
  public IsCrud: boolean;
  public EditComponent: string;
  public AddComponent: string;
  public TranCode?: string;
  public IsAdmin: boolean;
  public IsActive: boolean;
  public CreatedBy: number| null;
  public CreatedOn?: Date| null;
  public UpdatedBy?: number| null;
  public UpdatedOn?: Date| null;

  // ---------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------
  constructor(params: {
    moduleId: number;
    moduleName: string;
    parentId?: number;
    menuLevel: number;
    sortOrder: number;
    iconClass: string;
    componentName: string;
    controllerName: string;
    feUrl: string;
    isParent: boolean;
    isCrud: boolean;
    editComponent: string;
    addComponent: string;
    tranCode?: string;
    isAdmin: boolean;
    isActive: boolean;
    createdBy: number;
    createdOn?: Date;
  }) {
    if (!params.moduleName.trim()) {
      throw new Error("Module name is required.");
    }

    this.ModuleId = params.moduleId;
    this.ModuleName = params.moduleName;
    this.ParentId = params.parentId;
    this.MenuLevel = params.menuLevel;
    this.SortOrder = params.sortOrder;
    this.IconClass = params.iconClass;
    this.ComponentName = params.componentName;
    this.ControllerName = params.controllerName;
    this.FeUrl = params.feUrl;
    this.IsParent = params.isParent;
    this.IsCrud = params.isCrud;
    this.EditComponent = params.editComponent;
    this.AddComponent = params.addComponent;
    this.TranCode = params.tranCode;
    this.IsAdmin = params.isAdmin;
    this.IsActive = params.isActive;
    this.CreatedBy = params.createdBy;
    this.CreatedOn = params.createdOn;
  }

  // ---------------------------------------------------------
  // Domain Methods
  // ---------------------------------------------------------
  public activate(updatedBy: number): void {
    this.IsActive = true;
    this.UpdatedBy = updatedBy;
  }

  public deactivate(updatedBy: number): void {
    this.IsActive = false;
    this.UpdatedBy = updatedBy;
  }

  public setParent(parentId: number | undefined, isParent: boolean, updatedBy: number): void {
    this.ParentId = parentId;
    this.IsParent = isParent;
    this.UpdatedBy = updatedBy;
  }

  public updateDetails(params: {
    moduleName?: string;
    menuLevel?: number;
    sortOrder?: number;
    iconClass?: string;
    componentName?: string;
    controllerName?: string;
    feUrl?: string;
    isCrud?: boolean;
    editComponent?: string;
    addComponent?: string;
    tranCode?: string;
    isAdmin?: boolean;
    isActive?: boolean;
    updatedBy?: number;
  }): void {
    if (params.moduleName && params.moduleName.trim()) {
      this.ModuleName = params.moduleName;
    }
    if (params.menuLevel !== undefined) {
      this.MenuLevel = params.menuLevel;
    }
    if (params.sortOrder !== undefined) {
      this.SortOrder = params.sortOrder;
    }
    if (params.iconClass && params.iconClass.trim()) {
      this.IconClass = params.iconClass;
    }
    if (params.componentName && params.componentName.trim()) {
      this.ComponentName = params.componentName;
    }
    if (params.controllerName && params.controllerName.trim()) {
      this.ControllerName = params.controllerName;
    }
    if (params.feUrl && params.feUrl.trim()) {
      this.FeUrl = params.feUrl;
    }
    if (params.isCrud !== undefined) {
      this.IsCrud = params.isCrud;
    }
    if (params.editComponent && params.editComponent.trim()) {
      this.EditComponent = params.editComponent;
    }
    if (params.addComponent && params.addComponent.trim()) {
      this.AddComponent = params.addComponent;
    }
    if (params.tranCode !== undefined) {
      this.TranCode = params.tranCode;
    }
    if (params.isAdmin !== undefined) {
      this.IsAdmin = params.isAdmin;
    }
    if (params.isActive !== undefined) {
      this.IsActive = params.isActive;
    }
    if (params.updatedBy !== undefined) {
      this.UpdatedBy = params.updatedBy;
    }
  }
}
