# 🗄 Multi-Database Support System (Full Guide)

This system supports multiple SQL databases through a single abstraction layer using **Sequelize**.

Each database requires:

* `DB_TYPE` configuration
* corresponding Node.js driver (`node_modules`)
* optional OS-level dependencies (for Oracle / MSSQL in some environments)

---
## 📦 `DatabaseSettings`

Location:

```text
Infrastructure/Core/DatabaseSettings.ts
```

# ⚙️ Supported Databases

## ✅ Currently Supported

| DB_TYPE         | Engine               | Status            |
| --------------- | -------------------- | ----------------- |
| `sqlite`        | SQLite file-based    | ✅ Ready           |
| `sqlite-memory` | In-memory SQLite     | ✅ Ready           |
| `postgres`      | PostgreSQL           | ✅ Ready           |
| `mysql`         | MySQL / MariaDB      | ✅ Ready           |
| `mssql`         | Microsoft SQL Server | ✅ Ready           |
| `oracle`        | Oracle DB            | ⚠️ Advanced setup |

---

# 📦 Required Node Modules

## 🧩 Core Dependency (Always Required)

```bash id="core"
npm install sequelize
```

---

# 🗄 SQLite

## Supported Types

* `sqlite`
* `sqlite-memory`

## Install

```bash id="sqlite"
npm install sqlite3
```

---

## Behavior

| Mode            | Storage              |
| --------------- | -------------------- |
| `sqlite`        | file (`app.sqlite3`) |
| `sqlite-memory` | `:memory:`           |

---

# 🐘 PostgreSQL

## Install

```bash id="pg"
npm install pg pg-hstore
```

## DB_TYPE

```env id="pg-env"
DB_TYPE=postgres
```

---

# 🐬 MySQL / MariaDB (NEW)

## Install

```bash id="mysql"
npm install mysql2
```

---

## DB_TYPE

```env id="mysql-env"
DB_TYPE=mysql
```

---

## Notes

* Sequelize uses `mysql2` for both:

  * MySQL
  * MariaDB
* Recommended version: `mysql2 >= 3.x`

---

## Connection Example

```text id="mysql-conn"
mysql://user:pass@localhost:3306/dbname
```

---

# 🪟 Microsoft SQL Server (MSSQL)

## Install

```bash id="mssql"
npm install tedious
```

---

## DB_TYPE

```env id="mssql-env"
DB_TYPE=mssql
```

---

## Notes

* Requires TCP enabled (default 1433)
* Authentication must allow SQL logins

---

# 🐘 Oracle DB (Advanced)

## Install

```bash id="oracle"
npm install oracledb
```

---

## DB_TYPE

```env id="oracle-env"
DB_TYPE=oracle
```

---

## ⚠️ Requirements

* Oracle Instant Client must be installed
* OS-level dependency (not just npm)

---

# 🔁 DB Driver Mapping

| DB_TYPE       | Sequelize Dialect | Required Package |
| ------------- | ----------------- | ---------------- |
| sqlite        | sqlite            | sqlite3          |
| sqlite-memory | sqlite            | sqlite3          |
| postgres      | postgres          | pg + pg-hstore   |
| mysql         | mysql             | mysql2           |
| mssql         | mssql             | tedious          |
| oracle        | oracle            | oracledb         |

---

# ⚙️ How Database Resolution Works

```text id="flow1"
.env
   ↓
DatabaseSettings
   ↓
Normalize DB_TYPE
   ↓
Map Sequelize dialect
   ↓
Load node driver (npm package)
   ↓
Create Sequelize instance
```

---

# 🧩 Adding a New Database (General Steps)

## 1. Install driver

Example:

```bash id="install"
npm install mysql2
```

---

## 2. Set environment variable

```env id="env"
DB_TYPE=mysql
```

---

## 3. Ensure dialect is supported by Sequelize

Sequelize supports:

* sqlite
* postgres
* mysql
* mariadb (via mysql2)
* mssql
* db2 (experimental)
* snowflake (community)

---

## 4. Update optional dialect config (if needed)

Example MSSQL:

```ts id="mssql"
if (this.type === "mssql") {
  options.dialectOptions = {
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  };
}
```

---

## 5. Restart application

```bash id="restart"
nd-db -s -e dev
nd-api -e dev
```

---

# 🔁 Environment Integration

| Env    | Behavior            |
| ------ | ------------------- |
| `dev`  | loads `.env.dev`    |
| `prod` | loads `.env`        |
| custom | fallback system env |

---

# 🧪 Recommended Install Matrix

## Full Development Setup

```bash id="full"
npm install sequelize sqlite3 pg pg-hstore mysql2 tedious oracledb
```

---

## Minimal Setup (SQLite only)

```bash id="minimal"
npm install sequelize sqlite3
```

---

# ⚠️ Important Rules

## 1. Sequelize does NOT auto-install drivers

You must install manually:

```text id="rule1"
mysql2, pg, sqlite3, etc.
```

---

## 2. DB_TYPE must match installed driver

| DB_TYPE  | Must have |
| -------- | --------- |
| mysql    | mysql2    |
| postgres | pg        |
| sqlite   | sqlite3   |
| mssql    | tedious   |

---

## 3. sqlite-memory is ephemeral

```text id="rule2"
data is lost on restart
```

---

## 4. Invalid DB_TYPE will crash startup

```text id="rule3"
unknown dialect → Sequelize error
```

---

# 🧠 Architecture Overview

```text id="arch"
.env
  ↓
DatabaseSettings
  ↓
Dialect + driver resolution
  ↓
Sequelize instance
  ↓
AppDBContext
  ↓
Repositories / Models
```

---

# 🎯 Key Takeaways

* One unified DB system across all engines
* Each DB requires a specific npm driver
* MySQL uses `mysql2`
* PostgreSQL uses `pg`
* MSSQL uses `tedious`
* Oracle requires OS-level installation
* SQLite supports both file and memory modes
