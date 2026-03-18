// ===================================================================
// 🧩 src/Infrastructure/Audit/AuditContext.ts
// ===================================================================
import { AsyncLocalStorage } from "async_hooks";

export interface AuditInfo {
  changedBy: string;
  correlationId?: string | null;
  source?: string | null;
}

const auditStorage = new AsyncLocalStorage<AuditInfo>();

export class AuditContext {
  // Run code in audit context
  static run<T>(auditInfo: AuditInfo, callback: () => T): T {
    return auditStorage.run(auditInfo, callback);
  }

  static get(): AuditInfo | null {
    return auditStorage.getStore() ?? null;
  }
}