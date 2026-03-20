// ===================================================================
// 🧩 registerAuditHooks.ts
// ===================================================================
import { Sequelize, Model } from "sequelize";
import { AuditContext } from "./AuditContext.ts";
import { AuditHandler, TABLE_AUDIT_EXCLUDED } from "./AuditHandler.ts";

export function registerAuditHooks(sequelize: Sequelize) {
  (sequelize as any).__auditHooksRegistered = true;

  const handle = async (
    instance: Model,
    action: "INSERT" | "UPDATE" | "DELETE",
    options: any
  ) => {
    const auditInfo = AuditContext.get();
    const showLog = options?.transaction?.__auditMeta?.showlog;    

    // ✅ Resolve PK fields
    const pkFields = Object.keys((instance.constructor as any).primaryKeys ?? {});
    const finalPkFields = pkFields.length ? pkFields : ["id"];

    // ✅ Create handler per execution
    const handler = new AuditHandler(finalPkFields, showLog);

    try {
      await handler.createAudit(
        instance,
        action,
        auditInfo,
        options?.transaction, //undefined, //options?.transaction
      );
    } catch (err) {
      console.error("❌ Audit failed:", err);
    }
  };
  sequelize.addHook("afterCreate", async (instance, options) => {
    await handle(instance, "INSERT", options);

    // const modelName = instance.constructor.name;
    // const tableName = (instance.constructor as any).tableName;

    // if (!(!tableName || TABLE_AUDIT_EXCLUDED.has(tableName))) {
    //   console.log(`→ Audit: ${modelName} INSERT`);
    // }
  });  

  sequelize.addHook("afterUpdate", async (instance, options) => {
    await handle(instance, "UPDATE", options);
  });

  sequelize.addHook("afterDestroy", async (instance, options) => {
    await handle(instance, "DELETE", options);
  });

  // sequelize.addHook("afterCreate", (instance, options) =>
  //   handle(instance, "INSERT", options)
  // );
  //--> Error whe this is used
  // sequelize.addHook("afterCreate", (instance, options) => {
  //   handle(instance, "INSERT", options)
  //   const modelName = instance.constructor.name;
  //   const tableName = (instance.constructor as any).tableName;
  //   if (!(!tableName || TABLE_AUDIT_EXCLUDED.has(tableName))){
  //     console.log(`→ Audit: ${modelName} ${"INSERT"}`);
  //   }
  // });
  // sequelize.addHook("afterUpdate", (instance, options) =>
  //   handle(instance, "UPDATE", options)
  // );

  // sequelize.addHook("afterDestroy", (instance, options) =>
  //   handle(instance, "DELETE", options)
  // );
}
