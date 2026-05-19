# Clean Architecture + DDD + CQRS (Node.js + Express + Sequelize)

A scalable backend boilerplate built with:

- Node.js + Express
- TypeScript
- Sequelize ORM
- Clean Architecture
- Domain-Driven Design (DDD)
- CQRS pattern
- Modular monolith structure
- Multi-layer separation of concerns

Designed for enterprise systems, SaaS platforms, and long-term maintainability.

---

# 🧠 Architecture Overview

This project enforces strict separation between HTTP, application logic, domain rules, and persistence.

## Write Flow (Commands)

```text
Route
 → Controller
   → Command
     → Handler / Service
       → Repository
       → Domain
       → UnitOfWork / Transaction
````

---

## Read Flow (Queries)

```text
Route
 → Controller
   → QueryService
     → Sequelize / DB Layer
     → DTO / Projection Mapper
```

> Queries NEVER return domain entities.

---

# 🧱 Core Principles

## 1. Domain is Framework Agnostic

The domain layer contains pure business logic only.

🚫 No Express
🚫 No Sequelize
🚫 No HTTP
🚫 No infrastructure concerns

✔ Pure TypeScript classes

```ts
export class User {
  constructor(
    public id: string,
    public username: string,
    public active: boolean = true
  ) {}

  deactivate() {
    this.active = false;
  }
}
```

---

## 2. Strict CQRS Separation

### Commands

* Create / Update / Delete
* Business rules
* Transactions

### Queries

* Reads only
* Optimized SQL/Sequelize queries
* DTO projections

---

## 3. Thin Controllers

Controllers only orchestrate:

* Request handling
* Calling services
* Returning responses

Example:

```ts
export class UserController {
  constructor(
    private readonly userQueryService: UserQueryService
  ) {}

  async listUsers(req, res) {
    const result = await this.userQueryService.listUsers({
      page: Number(req.query.page ?? 1),
      limit: Number(req.query.limit ?? 10),
    });

    return res.json(result);
  }
}
```

---

## 4. Infrastructure Isolation

Sequelize lives ONLY in:

```
04-Infrastructure/Persistence
```

Domain and Application layers never import Sequelize directly.

---

# 📁 Project Structure

```
src/
├── 01-Api
│   ├── Controllers
│   │   └── Base
│   ├── Routes
│   ├── Middleware
│   └── Helpers
│
├── 01-Contracts
│   ├── Auth
│   ├── Base
│   └── Common
│
├── 02-Application
│   ├── Commands
│   ├── Handlers
│   ├── Queries
│   ├── QueryServices
│   ├── Services
│   ├── DTO
│   ├── UseCases
│   ├── Interfaces
│   └── UoW
│
├── 03-Domain
│   ├── Entities
│   ├── Interfaces
│   └── Services
│
├── 04-Infrastructure
│   ├── Core
│   ├── Auth
│   ├── Persistence
│   │   ├── Models
│   │   ├── Repositories
│   │   ├── Mappers
│   │   └── Queries
│   ├── Email
│   ├── Dependencies
│   └── Adapters
│
├── 05-Test
├── Scripts
├── types
└── main.ts
```

---

# 🧩 Layer Responsibilities

## API Layer (01-Api)

* Express routes
* Controllers
* Middleware
* Request validation

---

## Contracts (01-Contracts)

* API request/response schemas
* Versioned DTOs
* No business logic

---

## Application Layer (02-Application)

* Commands & Handlers
* Query services
* Use cases
* DTO mapping
* Orchestration logic

---

## Domain Layer (03-Domain)

* Entities
* Business rules
* Domain services
* Interfaces (repositories)

---

## Infrastructure Layer (04-Infrastructure)

* Sequelize models
* Repository implementations
* External services (Email, Auth, etc.)
* DB configuration
* Adapters

---

# 🧬 Sequelize Usage Rule

Sequelize is strictly confined to:

```
04-Infrastructure/Persistence/Models
04-Infrastructure/Persistence/Repositories
```

Domain layer NEVER touches ORM.

---

# 🔐 Authentication & Authorization

Located in:

```
04-Infrastructure/Auth
02-Application/Commands/Auth
03-Domain/Entities/Auth
```

Supports:

* JWT authentication
* Local auth
* OneLogin (SSO)
* Role-based access control (RBAC)

---

# 📦 Seeding & Scripts

Database seeding pipeline:

```
Scripts/Migrations/
```

Includes:

* DB setup
* Seed runners
* CSV-based seeders
* CLI seeding tools

Run:

```bash
npm run seed
npm run seed -- --create-db
```

---

# 🧪 Testing

Located in:

```
05-Test
```

Run tests:

```bash
npm test
```

---

# 🚀 Getting Started

## Install Dependencies

```bash
npm install
```

---

## Run Development Server

```bash
npm run dev
```

---

## Build

```bash
npm run build
```

---

## Run Seeder

```bash
npm run seed
```

---

# 🔄 API Flow Example

### Create User (Command)

```text
Route → Controller → Command → Handler → Repository → DB
```

### List Users (Query)

```text
Route → Controller → QueryService → Sequelize → DTO
```

---

# 🧠 Design Philosophy

> Routes handle HTTP concerns
> Controllers orchestrate flow
> Application executes use cases
> Domain enforces business rules
> Infrastructure handles external systems

---

# ⚙️ Key Design Decisions

### Why CQRS?

* Separates read/write complexity
* Improves scalability
* Optimizes queries independently

### Why Clean Architecture?

* Framework independence
* Easier testing
* Long-term maintainability

### Why Sequelize in Infrastructure?

* Keeps domain pure
* Enables DB swap (Postgres → Mongo)

---

# 🔮 Future Enhancements

* Event Bus (Domain Events)
* Outbox Pattern
* Redis caching layer
* Background job system (BullMQ)
* Multi-tenant support
* Auto route registration
* Service container / DI framework
* GraphQL adapter

---

# 📚 Documentation

* `_Docs/audit.md`
* `_Docs/db/readme-db.md`
* `readme-developer-guide.md`
* `readme-run.md`

---

# 📄 License

MIT


