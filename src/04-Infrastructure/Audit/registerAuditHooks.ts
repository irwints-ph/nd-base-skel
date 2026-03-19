// ===================================================================
// 🧩 registerAuditHooks.ts
// ===================================================================
import { Sequelize, Model } from "sequelize";
import { AuditContext } from "./AuditContext.ts";
import { AuditHandler } from "./AuditHandler.ts";

export function registerAuditHooks(sequelize: Sequelize) {
  (sequelize as any).__auditHooksRegistered = true;

  const handle = async (
    instance: Model,
    action: "INSERT" | "UPDATE" | "DELETE",
    options: any
  ) => {
    const auditInfo = AuditContext.get();
    const showLog = options?.transaction?.__auditMeta?.showlog;    
    // // Test Logs
    // const modelName = instance.constructor.name;
    // const tableName = (instance.constructor as any).tableName;
    // console.log(`✅ ${action} → Model: ${modelName}, Table: ${tableName}`);

    // ✅ Resolve PK fields
    const pkFields = Object.keys((instance.constructor as any).primaryKeys ?? {});
      // options?.transaction?.__auditMeta?.idFields ??
      // Object.keys((instance.constructor as any).primaryKeys ?? {});

    const finalPkFields = pkFields.length ? pkFields : ["id"];

    // ✅ Create handler per execution
    const handler = new AuditHandler(finalPkFields, showLog);

    try {
      await handler.createAudit(
        instance,
        action,
        auditInfo,
        options?.transaction
      );
    } catch (err) {
      console.error("❌ Audit failed:", err);
    }
  };

  sequelize.addHook("afterCreate", (instance, options) =>
    handle(instance, "INSERT", options)
  );

  sequelize.addHook("afterUpdate", (instance, options) =>
    handle(instance, "UPDATE", options)
  );

  sequelize.addHook("afterDestroy", (instance, options) =>
    handle(instance, "DELETE", options)
  );
}
