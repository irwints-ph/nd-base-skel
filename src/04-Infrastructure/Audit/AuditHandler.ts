// ===================================================================
// 🧩 src/infrastructure/audit/AuditHandler.ts
// ===================================================================
import { sequelize } from "@Infrastructure/Core/sequelize.ts"
import { Transaction, Model } from "sequelize";
import AuditLogs from "@Infrastructure/Persistence/Models/Base/AuditLogs.ts";
import { AuditInfo } from "./AuditContext.ts";
import {
  serializeFullObject,
  serializeValue,
} from "../Core/Serialization.ts";
import { DatabaseNamingConvention } from "@Infrastructure/Core/DatabaseNaming.ts";

const AuditLogsTableName = DatabaseNamingConvention.getName("AuditLogs");
const EXCLUDED = new Set<string>([AuditLogsTableName]);

type ActionType = "INSERT" | "UPDATE" | "DELETE";

export class AuditHandler {
  private audited = new Set<string>();

  constructor(
    private idFields: string[] = ["id"],
    private showlog = false
  ) {}

  // -----------------------------------------------------------------
  // 🧱 MAIN ENTRY
  // -----------------------------------------------------------------

  async createAudit(
    obj: Model,
    action: ActionType,
    auditInfo: AuditInfo | null,
    transaction?: Transaction
  ): Promise<void> {
    const tableName = (obj.constructor as any)?.tableName;
    if (!tableName || EXCLUDED.has(tableName)) return;

    const dedupeKey = `${tableName}-${obj.get(this.idFields[0])}-${action}`;
    if (this.audited.has(dedupeKey)) return;
    this.audited.add(dedupeKey);

    const keyValues = this.buildKeyValues(obj);

    const { oldValues, newValues } = this.resolveValues(obj, action);

    // Skip empty updates
    if (action === "UPDATE" && !oldValues && !newValues) return;

    if (this.showlog) {
      console.log(`🔹 Audit: ${tableName} ${action} ${JSON.stringify(keyValues)}`);
      // console.log(`🔹 Audit: ${dedupeKey}`);
    }

    await AuditLogs.create(
      {
        TableName: tableName,
        Action: action,
        KeyValues: JSON.stringify(keyValues),
        OldValues: JSON.stringify(oldValues ?? {}),
        NewValues: JSON.stringify(newValues ?? {}),
        ChangedBy: auditInfo?.changedBy ?? "UNKNOWN",
        CorrelationId: auditInfo?.correlationId ?? undefined,
      },
      { transaction }
    );
  }

  // -----------------------------------------------------------------
  // 🔑 KEY VALUES
  // -----------------------------------------------------------------

  private buildKeyValues(obj: Model): Record<string, any> {
    const keyDict: Record<string, any> = {};

    for (const field of this.idFields) {
      keyDict[field] = obj.get(field);
    }

    return keyDict;
  }

  // -----------------------------------------------------------------
  // 🔍 VALUE RESOLUTION
  // -----------------------------------------------------------------

  private resolveValues(obj: Model, action: ActionType) {
    if (action === "INSERT") {
      return {
        oldValues: null,
        newValues: serializeFullObject(obj),
      };
    }

    if (action === "DELETE") {
      return {
        oldValues: serializeFullObject(obj),
        newValues: null,
      };
    }

    if (action === "UPDATE") {
      return this.resolveUpdateValues(obj);
    }

    return { oldValues: null, newValues: null };
  }

  // -----------------------------------------------------------------
  // ✏️ UPDATE HANDLING (Improved)
  // -----------------------------------------------------------------

  private resolveUpdateValues(obj: Model) {
    const oldDict: Record<string, any> = {};
    const newDict: Record<string, any> = {};

    const changedFields = obj.changed() as string[] | false;

    if (!changedFields) {
      return { oldValues: null, newValues: null };
    }

    for (const key of changedFields) {
      const prev = obj.previous(key);
      const curr = obj.get(key);

      if (!this.hasChanged(prev, curr)) continue;

      oldDict[key] = serializeValue(prev);
      newDict[key] = this.expandValue(curr);
    }

    if (Object.keys(oldDict).length === 0) {
      return { oldValues: null, newValues: null };
    }

    return {
      oldValues: oldDict,
      newValues: newDict,
    };
  }

  // -----------------------------------------------------------------
  // 🧠 CHANGE DETECTION
  // -----------------------------------------------------------------

  private hasChanged(prev: any, curr: any): boolean {
    if (prev === curr) return false;

    // Handle objects safely
    if (typeof prev === "object" || typeof curr === "object") {
      return JSON.stringify(prev) !== JSON.stringify(curr);
    }

    return true;
  }

  // -----------------------------------------------------------------
  // 🔄 EXPANSION (Python parity)
  // -----------------------------------------------------------------

  private expandValue(value: any): any {
    if (!value) return value;

    // Sequelize model
    if (value?.constructor?.tableName) {
      return serializeFullObject(value);
    }

    if (Array.isArray(value)) {
      return value.map((v) => this.expandValue(v));
    }

    if (typeof value === "object") {
      const result: Record<string, any> = {};
      for (const key of Object.keys(value)) {
        result[key] = this.expandValue(value[key]);
      }
      return result;
    }

    return serializeValue(value);
  }
}