// 🧩 UnitOfWork.ts (Refactored)

import { Sequelize, Transaction, Model } from "sequelize";
import { AuditContext } from "#Infrastructure/Audit/AuditContext.ts";
import { AuditHandler } from "#Infrastructure/Audit/AuditHandler.ts";

type ChangeType = "INSERT" | "UPDATE" | "DELETE";

export class UnitOfWork {
  private sequelize: Sequelize;
  public transaction: Transaction;
  private auditHandler: AuditHandler;

  private trackedChanges: Array<{
    instance: Model;
    type: ChangeType;
  }> = [];

  private committed = false;
  private showlog: boolean;

  constructor(
    sequelize: Sequelize,
    options: { idFields?: string[]; showlog?: boolean },
    tx: Transaction
  ) {
    this.sequelize = sequelize;
    this.transaction = tx;
    this.showlog = options.showlog ?? false;

    this.auditHandler = new AuditHandler(
      options.idFields ?? ["id"],
      this.showlog
    );

    if (this.showlog) {
      console.log("🔹 UnitOfWork started");
    }
  }

  // -----------------------------------------------------------------
  // 📌 TRACK CHANGES (Manual instead of hooks)
  // -----------------------------------------------------------------

  public trackNew(instance: Model) {
    this.trackedChanges.push({ instance, type: "INSERT" });
  }

  public trackUpdate(instance: Model) {
    this.trackedChanges.push({ instance, type: "UPDATE" });
  }

  public trackDelete(instance: Model) {
    this.trackedChanges.push({ instance, type: "DELETE" });
  }

  // -----------------------------------------------------------------
  // 💾 COMMIT
  // -----------------------------------------------------------------

  public async commit(): Promise<void> {
    if (this.committed) return;

    if (this.showlog) {
      console.log("🔹 UnitOfWork commit started");
    }

    try {
      await this.transaction.commit();
      this.committed = true;

      await this.runAudit(); // 🔥 equivalent of after_flush

      if (this.showlog) {
        console.log("✅ UnitOfWork commit successful");
      }
    } catch (err) {
      if (this.showlog) {
        console.log("❌ Commit failed, rolling back", err);
      }
      await this.rollback();
      throw err;
    }
  }

  // -----------------------------------------------------------------
  // 🔄 ROLLBACK
  // -----------------------------------------------------------------

  public async rollback(): Promise<void> {
    if (this.showlog) {
      console.log("🔹 Rolling back UnitOfWork");
    }
    await this.transaction.rollback();
  }

  // -----------------------------------------------------------------
  // 🔍 AUDIT EXECUTION (Flush Equivalent)
  // -----------------------------------------------------------------

  private async runAudit(): Promise<void> {
    const auditInfo = AuditContext.get();

    if (!auditInfo) {
      if (this.showlog) {
        console.log("⚠️  No AuditContext, skipping audit");
      }
      return;
    }

    if (this.showlog) {
      console.log(`🔹 Auditing ${this.trackedChanges.length} changes`);
    }

    for (const change of this.trackedChanges) {
      await this.auditHandler.createAudit(
        change.instance,
        change.type,
        auditInfo
      );
    }
  }

  // -----------------------------------------------------------------
  // 🧹 CLEANUP
  // -----------------------------------------------------------------

  public async dispose(): Promise<void> {
    // if (!this.committed) {
    //   await this.commit();
    // }

    if (this.showlog) {
      console.log("🔹 UnitOfWork disposed");
    }
  }
}