// ===================================================================
// 🧩 RepoActionService.ts
// ===================================================================
import { v4 as uuidv4 } from "uuid";
import { UnitOfWork } from "#Application/UoW/UnitOfWork.ts";
import { AuditContext, AuditInfo } from "#Infrastructure/Audit/AuditContext.ts";
import { sequelize } from "#Infrastructure/Persistence/AppDBContext.ts";
import { Transaction } from "sequelize";

type PerformRepoActionParams<T> = {
  changedBy: string;
  actionName: string;
  action: (uow: UnitOfWork) => Promise<T>;
  idFields?: string[];
  showlog?: boolean;
};

export async function performRepoAction<T>({
  changedBy,
  actionName,
  action,
  idFields = [],
  showlog = false,
}: PerformRepoActionParams<T>): Promise<T> {

  const context: AuditInfo = {
    changedBy,
    correlationId: `${actionName.toUpperCase()}-${uuidv4()}`,
  };

  return AuditContext.run(context, async () => {
    return executeInTransaction({ action, idFields, showlog });
  });
}

// -------------------------------------------------------------------

async function executeInTransaction<T>({
  action,
  idFields,
  showlog,
}: {
  action: (uow: UnitOfWork) => Promise<T>;
  idFields: string[];
  showlog: boolean;
}): Promise<T> {

  return sequelize.transaction(async (tx: Transaction) => {

    // ✅ 🔥 CRITICAL: pass metadata to hooks
    (tx as any).__auditMeta = {
      idFields,
      showlog,
    };

    const uow = new UnitOfWork(sequelize, { idFields, showlog }, tx);

    try {
      return await action(uow);
    } finally {
      await uow.dispose();
    }
  });
}