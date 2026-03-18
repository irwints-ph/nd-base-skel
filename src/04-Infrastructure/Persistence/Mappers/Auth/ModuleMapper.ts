// =========================================================
// 🧩 src/04-Infrastructure/Persistence/Mappers/Auth/ModuleMapper.ts
// =========================================================
import ModuleMstr from '@Infrastructure/Persistence/Models/Auth/ModuleMstr.ts';
import { Module } from '@Domain/Entities/Auth/Module.ts';
import { AppTime } from "@Infrastructure/Core/AppTime.ts";

export class ModuleMapper {
  // -------------------------
  // ORM -> Domain
  // -------------------------
  static toDomain(model: ModuleMstr): Module {
    return new Module({
      moduleId: model.ModuleId,
      moduleName: model.ModuleName,
      parentId: model.ParentId ?? undefined,
      menuLevel: model.MenuLevel,
      sortOrder: model.SortOrder,
      iconClass: model.IconClass,
      componentName: model.ComponentName,
      controllerName: model.ControllerName,
      feUrl: model.FeUrl,
      isParent: model.IsParent,
      isCrud: model.IsCrud,
      editComponent: model.EditComponent,
      addComponent: model.AddComponent,
      tranCode: model.TranCode ?? undefined,
      isAdmin: model.IsAdmin,
      isActive: model.IsActive,
      createdBy: model.CreatedBy ?? 1,
      createdOn: model.CreatedOn ?? AppTime.utcNow(),
    });

  }
  /**
   * Converts a domain Module entity to a plain object for Sequelize
   */
  static toOrm(module: Module): ModuleMstr {
    const orm = ModuleMstr.build({
      ModuleName: module.ModuleName,
      ParentId: module.ParentId,
      MenuLevel: module.MenuLevel,
      SortOrder: module.SortOrder,
      IconClass: module.IconClass,
      ComponentName: module.ComponentName,
      ControllerName: module.ControllerName,
      FeUrl: module.FeUrl,
      IsParent: module.IsParent,
      IsCrud: module.IsCrud,
      EditComponent: module.EditComponent,
      AddComponent: module.AddComponent,
      TranCode: module.TranCode,
      IsAdmin: module.IsAdmin,
      IsActive: module.IsActive,
      CreatedBy: module.CreatedBy,
      CreatedOn: module.CreatedOn,
    });
    // Preserve identity
    if (module.ModuleId) {
      orm.ModuleId = module.ModuleId;
    }

    return orm;
  }
static toOrmPlain(module: Module): Record<string, any> {
  return {
    ModuleId: module.ModuleId,
    ModuleName: module.ModuleName,
    ParentId: module.ParentId,
    MenuLevel: module.MenuLevel,
    SortOrder: module.SortOrder,
    IconClass: module.IconClass,
    ComponentName: module.ComponentName,
    ControllerName: module.ControllerName,
    FeUrl: module.FeUrl,
    IsParent: module.IsParent,
    IsCrud: module.IsCrud,
    EditComponent: module.EditComponent,
    AddComponent: module.AddComponent,
    TranCode: module.TranCode,
    IsAdmin: module.IsAdmin,
    IsActive: module.IsActive,
    CreatedBy: module.CreatedBy,
    CreatedOn: module.CreatedOn,
  };
}

}