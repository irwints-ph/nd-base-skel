export function mapCreateModuleSeed(row: any) {
  const parseBoolean = (value?: string) =>
    ["TRUE", "1", "YES"].includes((value || "").toUpperCase());

  return {
    ModuleId: Number(row.moduleId),
    ModuleName: row.moduleName || "",
    ParentId: row.parentId ? Number(row.parentId) : undefined,
    MenuLevel: Number(row.menuLevel) || 0,
    SortOrder: Number(row.sortOrder) || 0,
    IconClass: row.iconClass || "",
    ComponentName: row.componentName || "",
    ControllerName: row.controllerName || "",
    FeUrl: row.feUrl || "",
    IsParent: parseBoolean(row.isParent),
    IsCrud: parseBoolean(row.isCrud),
    EditComponent: row.editComponent || "",
    AddComponent: row.addComponent || "",
    TranCode: row.tranCode || undefined,
    IsAdmin: parseBoolean(row.isAdmin),
    IsActive: parseBoolean(row.isActive),
  };
}
