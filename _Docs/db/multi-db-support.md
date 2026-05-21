# 🗄 Multi-Database Support System

This project supports **multiple database engines** using a unified configuration layer built on top of Sequelize.

All database behavior is controlled via:

```text
DB_TYPE
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASS
```

---

# ⚙️ Core Component

## 📦 `DatabaseSettings`

Location:

```text
Infrastructure/Core/DatabaseSettings.ts
```

This class is responsible for:

* Detecting database type
* Normalizing configuration
* Handling in-memory mode
* Generating Sequelize connection options
* Creating Sequelize instance

---

# 🧠 Supported Database Types

## ✅ Currently Supported

| DB_TYPE         | Engine               | Status   |
| --------------- | -------------------- | -------- |
| `sqlite`        | SQLite file-based DB | ✅ Active |
| `sqlite-memory` | In-memory SQLite     | ✅ Active |
| `postgres`      | PostgreSQL           | ✅ Active |
| `mssql`         | Microsoft SQL Server | ✅ Active |

---

## 🧪 Special Mode

### 🔹 `sqlite-memory`

```text
DB_TYPE=sqlite-memory
```

Behavior:

* Uses SQLite engine
* Runs entirely in RAM
* No file is created
* Automatically mapped to:

```text
:memory:
```

👉 Ideal for:

* unit tests
* CI pipelines
* temporary datasets

---

# 🔁 Database Type Resolution Flow

```text id="dbflow1"
.env DB_TYPE
   ↓
DatabaseSettings
   ↓
normalize type
   ↓
map to Sequelize dialect
   ↓
create Sequelize instance
```

---

# ⚙️ Dialect Mapping Logic

## Internal Rules

```ts id="map1"
this.rawType = process.env.DB_TYPE
```

Then:

| Input           | Internal Result       |
| --------------- | --------------------- |
| `sqlite`        | `sqlite`              |
| `sqlite-memory` | `sqlite` + `:memory:` |
| `postgres`      | `postgres`            |
| `mssql`         | `mssql`               |

---

# 🧩 Sequelize Configuration Output

## SQLite Mode

```ts id="sql1"
{
  dialect: "sqlite",
  storage: "app.sqlite3"
}
```

or memory mode:

```ts id="sql2"
{
  dialect: "sqlite",
  storage: ":memory:"
}
```

---

## PostgreSQL / MSSQL Mode

```ts id="sql3"
{
  dialect: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "...",
  database: "app"
}
```

---

### MSSQL Special Options

```ts id="sql4"
dialectOptions: {
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}
```

---

# 🔌 Connection String Format

## SQLite

```text id="conn1"
sqlite:app.sqlite3
```

---

## PostgreSQL / MSSQL

```text id="conn2"
postgres://user:pass@localhost:5432/app
```

or

```text id="conn3"
mssql://user:pass@localhost:1433/app
```

---

# 🚀 Sequelize Instance Creation

## Factory Method

```ts id="factory1"
createSequelize(): Sequelize
```

Used by:

```text id="factory2"
AppDBContext.ts
```

Flow:

```text id="factory3"
DatabaseSettings
   ↓
sequelizeOptions
   ↓
new Sequelize()
```

---

# 🧪 Debug Utility

## `debugSummary()`

Prints current configuration:

```text id="debug1"
[Database] Type: postgres
[Database] Name: app
[Database] Host: localhost:5432
[Database] User: postgres
[Database] Show SQL: true
```

---

# 🌍 Environment Integration

Database config is loaded from:

```text id="env1"
EnvConfig → process.env
```

Priority:

| Priority | Source                          |
| -------- | ------------------------------- |
| 1        | `.env.dev` (if ENVIRONMENT=dev) |
| 2        | `.env`                          |
| 3        | system environment              |

---

# 🔁 Runtime Behavior in Dev Setup

## Example: Dev Mode (SQLite file)

```bash id="run1"
DB_TYPE=sqlite
DB_NAME=app.sqlite3
```

→ File-based DB used

---

## Example: Test Mode (In-Memory)

```bash id="run2"
DB_TYPE=sqlite-memory
```

→ Fully ephemeral DB

---

## Example: Production (Postgres)

```bash id="run3"
DB_TYPE=postgres
DB_HOST=prod-db
```

→ External DB connection

---

# 🧠 Architecture Role

```text id="arch1"
Environment (.env)
   ↓
DatabaseSettings
   ↓
Sequelize factory
   ↓
AppDBContext
   ↓
Repositories / Models
```

---

# 🎯 Design Goals

This system is designed to:

* support multiple DB engines without code changes
* allow environment switching (`dev/staging/prod`)
* enable in-memory testing
* keep Sequelize configuration centralized
* simplify CI/CD database switching

---

# 🔥 Key Takeaways

* One unified config class controls all DB types
* SQLite, Postgres, MSSQL supported out of the box
* `sqlite-memory` enables fast test execution
* Sequelize instance is always generated from a single source of truth
* Environment files control all runtime DB behavior
