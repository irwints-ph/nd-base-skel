# 📘 Developer Startup System

This project uses two PowerShell entrypoints:

| Script       | Purpose                   |
| ------------ | ------------------------- |
| `nd-api.ps1` | Start the API server      |
| `nd-db.ps1`  | Manage database + seeding |

---

# 🚀 `nd-api.ps1` — API Startup Script

## Purpose

Starts the Node.js API using `tsx`, with support for:

* environment switching
* custom port
* watch/debug mode
* consistent runtime configuration

---

## Usage

```powershell id="api1"
.\nd-api.ps1 [options]
```

---

## Parameters

| Parameter      | Alias | Description         | Default |
| -------------- | ----- | ------------------- | ------- |
| `-Environment` | `-e`  | Runtime environment | none    |
| `-l`           | —     | Source directory    | `src`   |
| `-p`           | —     | Port number         | `3000`  |
| `-watch`       | `-w`  | Enable watch mode   | `false` |

---

## Examples

---

### Default Start

```powershell id="api2"
.\nd-api.ps1
```

Runs:

* API → `http://localhost:3000`
* environment → default

---

### Development Environment

```powershell id="api3"
.\nd-api.ps1 -e dev
```

Behavior:

* sets:

```text id="api3a"
ENVIRONMENT=dev
```

* loads:

```text id="api3b"
.env.dev
```

* fallback:

```text id="api3c"
.env
```

---

### Custom Port

```powershell id="api4"
.\nd-api.ps1 -p 5000
```

Runtime:

```text id="api4a"
http://localhost:5000
```

---

### Watch Mode

```powershell id="api5"
.\nd-api.ps1 -watch
```

or:

```powershell id="api5b"
.\nd-api.ps1 -w
```

Uses:

```bash id="api5c"
tsx --watch
```

for hot reload development.

---

### Full Example

```powershell id="api6"
.\nd-api.ps1 -e dev -p 5000 -watch
```

---

## Runtime Execution

PowerShell runs:

```bash id="api7"
npx tsx --inspect src/main.ts --port 5000
```

or:

```bash id="api7b"
npx tsx --inspect --watch src/main.ts --port 5000
```

---

## Startup Flow

```text id="api8"
nd-api.ps1
   ↓
main.ts
   ↓
startServer()
   ↓
createApp()
   ↓
setupDatabase()
   ↓
app.listen(PORT)
```

---

## Port Resolution Priority

| Priority | Source           |
| -------- | ---------------- |
| 1        | CLI `--port`     |
| 2        | `.env PORT`      |
| 3        | `EnvConfig.PORT` |
| 4        | `3000` fallback  |

---

## Shutdown Handling

Handles:

* `SIGINT`
* `SIGTERM`

Flow:

```text id="api9"
signal received
   ↓
shutdownDatabase()
   ↓
server.close()
   ↓
process exit
```

---

# 🗄 `nd-db.ps1` — Database Utility Script

## Purpose

Handles database lifecycle operations:

* reset / seed database
* drop tables
* run dataset variations
* environment-specific configuration

---

## Usage

```powershell id="db1"
.\nd-db.ps1 [options]
```

---

## Parameters

| Parameter      | Alias | Description               |
| -------------- | ----- | ------------------------- |
| `-Environment` | `-e`  | Set runtime environment   |
| `-Seed`        | `-s`  | Run database seeding      |
| `-Nav`         | `-n`  | Run navigation generation |
| `-Both`        | `-b`  | Run seed + nav            |
| `-DeleteFile`  | `-d`  | Drop DB tables only       |
| `-CsvSuffix`   | `-cs` | Filter seed dataset       |
| `-Help`        | `-h`  | Show help                 |

---

# 🌍 Environment Handling

When:

```powershell id="db-env1"
-e dev
```

is used:

```text id="db-env2"
ENVIRONMENT=dev
```

### Configuration loading order:

| Priority | File       |
| -------- | ---------- |
| 1        | `.env.dev` |
| 2        | `.env`     |
| 3        | system env |

---

# 📌 Examples

---

## Show Help

```powershell id="db0"
.\nd-db.ps1 -h
```

---

## Seed Database

```powershell id="db2"
.\nd-db.ps1 -s
```

Internally:

```bash id="db2a"
npx tsx src/Scripts/Migrations/seed_db_cli.ts --reset
```

---

## Seed with Dev Environment

```powershell id="db3"
.\nd-db.ps1 -s -e dev
```

Loads:

* `.env.dev`
* uses `ENVIRONMENT=dev`

---

## Seed with CSV Filter

```powershell id="db4"
.\nd-db.ps1 -s -cs test
```

Used for:

* filtered seed datasets
* environment-specific fixtures

---

## Run Seed + Nav

```powershell id="db5"
.\nd-db.ps1 -b
```

Runs both:

* database seed/reset
* navigation generation step (internal placeholder)

---

## Drop Database Only

```powershell id="db6"
.\nd-db.ps1 -d
```

Executes:

```bash id="db6a"
--drop-db-only
```

No seeding occurs.

---

# ⚙️ Seeder Execution Flow

When `-s` is used:

```text id="flow1"
nd-db.ps1
   ↓
seed_db_cli.ts
   ↓
seedDatabase()
   ↓
drop/create schema
   ↓
runSeeders(dataDir, cs)
```

---

# 🧠 Seeder CLI Behavior

File:

```ts id="flow2"
seed_db_cli.ts
```

Logic:

```ts id="flow3"
const args = parseArgs(process.argv);
await seedDatabase(args);
```

---

# 🔄 Database Reset Flow

```text id="flow4"
drop tables / reset file
   ↓
createDatabaseIfNotExists()
   ↓
InitModels()
   ↓
sequelize.sync()
   ↓
runSeeders()
```

---

# 🧪 Common Dev Workflows

---

## Full Local Reset

```powershell id="wf1"
.\nd-db.ps1 -s -e dev
.\nd-api.ps1 -e dev -watch
```

---

## Quick API Start

```powershell id="wf2"
.\nd-api.ps1 -p 5000
```

---

## Test Dataset

```powershell id="wf3"
.\nd-db.ps1 -s -cs test
```

---

# 🧱 System Architecture Overview

```text id="arch1"
nd-api.ps1
   ↓
main.ts
   ↓
server.ts
   ↓
Express + Sequelize
```

```text id="arch2"
nd-db.ps1
   ↓
seed_db_cli.ts
   ↓
seedDatabase()
   ↓
Sequelize + Seeders
```

---

# 🎯 Design Goals

This setup is optimized for:

* fast local development
* reproducible database resets
* environment isolation (`dev/staging/prod`)
* test dataset switching (`-cs`)
* CI/CD compatibility
* clean separation of API vs DB tooling
