# Audit Logging Setup and Flow (TS + Express + Sequelize)

## Overview

This project implements audit logging for database changes (`INSERT`, `UPDATE`, `DELETE`) using Sequelize hooks and custom handlers. Audit logs are stored in the `AuditLogs` table.

---

## Core Principle

* **Audit logging only works if `AuditContext` is set before repository actions.**
* **Audit hooks are registered globally during API setup, not during seeding.**
* **AuditContext must always be cleared after execution** to prevent context leakage.

There are two audit flows:

1. **Handler Flow (Automatic, hooks enabled)**
2. **Seeder Flow (Manual, no hooks)**

---

# How Audit Is Triggered

* **API calls** → Hooks (`afterCreate`, `afterUpdate`, `afterDestroy`) fire automatically.
* **Seeder scripts** → Hooks are not registered; audit must be handled manually.

---

# 1. Handler-Based Audit Flow (Automatic, Hooks Enabled)

## How It Works

* Triggered by API requests (Express routes).
* Uses `performRepoAction`.
* Hooks are registered once in `setupDatabase()` via `registerAuditHooks(sequelize)`.
* Fully manages:
  * `AuditContext.set()`
  * `AuditContext.clear()`
  * Automatic audit logging via hooks.

---

## Flow Steps

1. **Request received**
2. **Handler calls `performRepoAction`**
3. **AuditContext is set**
4. **UnitOfWork executes with transaction**
5. **Hooks trigger audit**
6. **Audit logs are written**
7. **AuditContext is cleared**

---

# 2. Seeder-Based Audit Flow (Manual, No Hooks)

## How It Works

* Used in migration / seeding scripts.
* Hooks are **not registered** — `registerAuditHooks.ts` is not called in seeder setup.
* Audit is controlled via:

```ts
export const doAudit = true | false;
```

* If `doAudit = true`, audit entries are created manually inside the seeder using `AuditContext`.

---

## Key Behavior

* `AuditContext.set()` → **manual**
* `AuditContext.clear()` → **manual**
* Context is **batch-scoped (entire seeding run)**.
* No hooks → audit logging depends entirely on seeder logic.

---

# Handler vs Seeder Audit Flow

| Aspect              | Handler Flow (Automatic, Hooks)                         | Seeder Flow (Manual, No Hooks)                      |
|---------------------|---------------------------------------------------------|-----------------------------------------------------|
| **Trigger**         | API request via Express route handler                   | Migration / seeding script execution                |
| **Hooks**           | Registered globally (`registerAuditHooks`)              | Not registered                                      |
| **AuditContext**    | Set automatically inside `performRepoAction`            | Must be set manually (`AuditContext.run(...)`)      |
| **Clear Context**   | Cleared automatically after request completes           | Must be cleared manually at end of seeding run      |
| **Scope**           | Per request (isolated to one API call)                  | Batch (entire seeding run shares one context)       |
| **Transaction**     | Managed by `UnitOfWork` inside `performRepoAction`      | Explicit transaction created in seeder template     |
| **AuditHandler**    | Invoked automatically via hooks                         | Not invoked — seeder must handle audit manually     |
| **Automation**      | Fully automatic                                         | Semi‑manual — developer controls `doAudit` flag     |
| **Risk**            | Low — context lifecycle is managed internally           | Higher — forgetting to clear context can corrupt audit data |
| **Use Case**        | Normal API operations (create/update/delete via handlers) | Bulk inserts/updates during migrations or seed runs |

---

# Final Takeaway

- **API calls** → Hooks are active, audit logging is automatic.  
- **Seeder scripts** → Hooks are not registered, audit logging is manual.  
- Always pair `AuditContext.set(...)` with `AuditContext.clear()` in seeders.  
- Forgetting to clear context in seeders risks **cross-record contamination**.  

---

> This will already have audit due to registerAuditHooks but no change by and correlationId

```ts
  const domainUser:User | null = await repo.getById(ormUser.UserId);
  if(domainUser){
    domainUser.addSso(
      ssokey,          // OneLogin ID
      1,               // OneLogin type
      ormUser.UserId   // Created by the sso user loginin
    );
    domainUser.validateEmail(email);
    const updatedOrmUSer = await repo.save(domainUser);          
    return updatedOrmUSer ? UserDtoMapper.toOrmUserFlatBase(updatedOrmUSer) : null;
  }
```
> To include change by and correlationId, run thru 
```ts
import { performRepoAction } from "@Infrastructure/Persistence/Services/RepoActionService.ts";

  const action = async (uow: any) => {
    repo.session = uow.transaction;// Good for showing log but has error on sqlite for OL Registration
    const domainUser:User | null = await repo.getById(ormUser.UserId);
    if(domainUser){
      domainUser.addSso(
        ssokey,          // OneLogin ID
        1,               // OneLogin type
        ormUser.UserId   // Created by the sso user loginin
      );
      domainUser.validateEmail(email);
      const updatedOrmUSer = await repo.save(domainUser);          
      return updatedOrmUSer ? UserDtoMapper.toOrmUserFlatBase(updatedOrmUSer) : null;
    }
  };
  const OutDomainUser = await performRepoAction({
    changedBy: ormUser.Username ?? "",
    actionName: "LinkSsoEmail",
    action,
    // idFields: ["UserId"], - not needed, sincwe this is automatically determined thru registerAuditHooks: Resolve PK fields
    showlog: false,
  });
  return OutDomainUser; //Updated ORM Values
```