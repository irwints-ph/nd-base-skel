// ===========================================
// 🧩 Domain/Entities/Base/AuditLog.ts
// ===========================================

export class AuditLog {
  public TableName: string;
  public Action: string;
  public KeyValues: string;
  public OldValues?: string;
  public NewValues?: string;
  public ChangedBy?: string;
  public CorrelationId?: string;
  public SubId?: string;
  public SubType?: string;
  public ChangedAt: Date;

  constructor(params: {
    tableName: string;
    action: string;
    keyValues: string;
    oldValues?: string;
    newValues?: string;
    changedBy?: string;
    changedAt: Date;
    correlationId?: string;
    subId?: string;
    subType?: string;
  }) {
    this.TableName = params.tableName;
    this.Action = params.action;
    this.KeyValues = params.keyValues;
    this.OldValues = params.oldValues;
    this.NewValues = params.newValues;
    this.ChangedBy = params.changedBy;
    this.CorrelationId = params.correlationId;
    this.SubId = params.subId;
    this.SubType = params.subType;
    this.ChangedAt = params.changedAt;
  }
}
