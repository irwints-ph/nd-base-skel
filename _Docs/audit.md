Absolutely — let’s lay this out **clean, repeatable, and boringly reliable** 😄
I’ll show you **exactly which files you need**, **where they live**, and **the step-by-step procedure** to wire this for **API requests** *and* **seeders / jobs**, mirroring your EF Core setup.

---

# 🧩 Target Architecture (DDD-aligned)

```
src/
├─ 02-Application
│  └─ Handlers / Commands (unchanged)
│
├─ 04-Infrastructure
│  ├─ Audit
│  │  ├─ AuditContext.ts
│  │  ├─ AuditMiddleware.ts
│  │  ├─ AuditHooks.ts
│  │  └─ registerAudit.ts
│  │
│  └─ Persistence
│     ├─ Models
│     │  └─ Audit
│     │     └─ AuditLogMstr.ts
│     └─ AppDBContext.ts
│
├─ Scripts
│  └─ Migrations / Seeders
│     └─ seed_modules.ts
│
└─ server.ts
```

---

# 1️⃣ AuditContext (AsyncLocal replacement)

### 📄 `src/04-Infrastructure/Audit/AuditContext.ts`

```ts
import { AsyncLocalStorage } from "node:async_hooks";

export interface AuditContextData {
  changedBy: string;
  correlationId?: string;
  subId?: string;
  subType?: string;
}

export const auditStorage =
  new AsyncLocalStorage<AuditContextData>();

export function getAuditContext(): AuditContextData | undefined {
  return auditStorage.getStore();
}
```

✅ Equivalent to `AuditContext.Current`

---

# 2️⃣ Audit Middleware (API requests)

### 📄 `src/04-Infrastructure/Audit/AuditMiddleware.ts`

```ts
import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { auditStorage } from "./AuditContext.ts";

export function auditMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auditContext = {
    changedBy:
      (req.user as any)?.username ??
      req.headers["x-user-id"]?.toString() ??
      "SYSTEM",

    correlationId:
      req.headers["x-correlation-id"]?.toString() ??
      crypto.randomUUID(),

    subId: req.headers["x-sub-id"]?.toString(),
    subType: "HTTP",
  };

  auditStorage.run(auditContext, () => next());
}
```

🔹 No cleanup needed — AsyncLocalStorage handles scope

---

# 3️⃣ Audit Hooks (EF SaveChangesInterceptor equivalent)

### 📄 `src/04-Infrastructure/Audit/AuditHooks.ts`

```ts
import { getAuditContext } from "./AuditContext.ts";
import AuditLogMstr from
  "@Infrastructure/Persistence/Models/Audit/AuditLogMstr.ts";

const EXCLUDED_TABLES = new Set([
  "audit_logs",
  "sequelize_meta",
]);

export async function auditInsert(instance: any, options: any) {
  const table = instance.constructor.getTableName();
  if (EXCLUDED_TABLES.has(table)) return;

  const audit = getAuditContext();

  await AuditLogMstr.create(
    {
      tableName: table,
      action: "INSERT",
      keyValues: JSON.stringify(getPrimaryKeys(instance)),
      newValues: JSON.stringify(instance.get({ plain: true })),
      changedBy: audit?.changedBy ?? "SYSTEM",
      correlationId: audit?.correlationId,
      subId: audit?.subId,
      subType: audit?.subType ?? "SYSTEM",
    },
    { transaction: options.transaction }
  );
}

export async function auditUpdate(instance: any, options: any) {
  const changed = instance.changed() as string[] | null;
  if (!changed || changed.length === 0) return;

  const table = instance.constructor.getTableName();
  if (EXCLUDED_TABLES.has(table)) return;

  const oldValues: Record<string, any> = {};
  const newValues: Record<string, any> = {};

  for (const field of changed) {
    oldValues[field] = instance.previous(field);
    newValues[field] = instance.get(field);
  }

  const audit = getAuditContext();

  await AuditLogMstr.create(
    {
      tableName: table,
      action: "UPDATE",
      keyValues: JSON.stringify(getPrimaryKeys(instance)),
      oldValues: JSON.stringify(oldValues),
      newValues: JSON.stringify(newValues),
      changedBy: audit?.changedBy ?? "SYSTEM",
      correlationId: audit?.correlationId,
      subId: audit?.subId,
      subType: audit?.subType ?? "SYSTEM",
    },
    { transaction: options.transaction }
  );
}

export async function auditDelete(instance: any, options: any) {
  const table = instance.constructor.getTableName();
  if (EXCLUDED_TABLES.has(table)) return;

  const audit = getAuditContext();

  await AuditLogMstr.create(
    {
      tableName: table,
      action: "DELETE",
      keyValues: JSON.stringify(getPrimaryKeys(instance)),
      oldValues: JSON.stringify(instance.get({ plain: true })),
      changedBy: audit?.changedBy ?? "SYSTEM",
      correlationId: audit?.correlationId,
      subId: audit?.subId,
      subType: audit?.subType ?? "SYSTEM",
    },
    { transaction: options.transaction }
  );
}

function getPrimaryKeys(instance: any) {
  const keys: Record<string, any> = {};
  for (const key of instance.constructor.primaryKeyAttributes) {
    keys[key] = instance.get(key);
  }
  return keys;
}
```

---

# 4️⃣ Hook Registration (one-time)

### 📄 `src/04-Infrastructure/Audit/registerAudit.ts`

```ts
import { sequelize } from
  "@Infrastructure/Persistence/AppDBContext.ts";

import {
  auditInsert,
  auditUpdate,
  auditDelete,
} from "./AuditHooks.ts";

export function registerAudit() {
  sequelize.addHook("afterCreate", auditInsert);
  sequelize.addHook("afterUpdate", auditUpdate);
  sequelize.addHook("afterDestroy", auditDelete);
}
```

---

# 5️⃣ API Bootstrap (equivalent to `UseMiddleware` + interceptor)

### 📄 `src/server.ts`

```ts
import express from "express";
import { auditMiddleware } from
  "@Infrastructure/Audit/AuditMiddleware.ts";
import { registerAudit } from
  "@Infrastructure/Audit/registerAudit.ts";

const app = express();

// 1️⃣ Register audit hooks ONCE
registerAudit();

// 2️⃣ Attach audit context middleware
app.use(auditMiddleware);

// routes...
app.listen(3000);
```

---

# 6️⃣ Seeder / Job usage (NO HTTP)

### 📄 `seed_modules.ts`

```ts
import { auditStorage } from
  "@Infrastructure/Audit/AuditContext.ts";

export async function seed_modules(...) {
  return auditStorage.run(
    {
      changedBy: "SEEDER",
      subType: "SEED",
      correlationId: "seed-modules",
    },
    async () => {
      // existing seeding logic
    }
  );
}
```

✅ Same hooks fire
✅ Same transaction
✅ Same audit log structure

---

# 7️⃣ What you do NOT touch

✔ Domain entities
✔ Factories
✔ Repositories
✔ Commands / Handlers

Auditing stays **pure infrastructure**, exactly like EF Core.

---

# 🧠 Mental model (EF → Node)

| EF Core                  | Node / Sequelize      |
| ------------------------ | --------------------- |
| `SaveChangesInterceptor` | Global model hooks    |
| `UseMiddleware<T>()`     | `app.use()`           |
| `AuditContext.Current`   | `AsyncLocalStorage`   |
| `DbContext`              | Sequelize instance    |
| Same transaction         | `options.transaction` |

---

# ✅ Final checklist

✔ Audit context per request
✔ Works for API, seeders, jobs
✔ One-time hook registration
✔ No recursion
✔ Transaction-safe
✔ DDD-compliant

---

If you want, next I can:

* Add **unit tests** for audit hooks
* Add **soft delete support**
* Add **tenant isolation**
* Or align **AuditLog schema** exactly with your C# version

You’re building a *very* solid foundation here.
