# ⚡ Quick Start Guide (nd-api / nd-db)

## 🧠 Recommended Order (IMPORTANT)

👉 Always run DB first before API:

```text id="flow0"
1. nd-db (reset / seed database)
2. nd-api (start server)
3. attach debugger (optional)
```

---

# 🗄 Step 1 — Database Setup (`nd-db`)

## 🚀 Quick Commands

| Action          | Command             |
| --------------- | ------------------- |
| Show help       | `nd-db -h`          |
| Seed DB         | `nd-db -s`          |
| Reset + Seed    | `nd-db -s`          |
| Dev environment | `nd-db -s -e dev`   |
| Filter dataset  | `nd-db -s -cs test` |
| Drop DB only    | `nd-db -d`          |

---

## 🌍 Environment Behavior

| Env       | Behavior                         |
| --------- | -------------------------------- |
| `dev`     | loads `.env.dev`                 |
| `staging` | loads `.env.staging` (if exists) |
| `prod`    | loads `.env` + system env        |

---

## 🔁 Reset Flow (Default Dev Start)

```bash id="db-reset"
nd-db -s -e dev
```

What happens:

```text id="dbflow"
Drop DB / tables
   ↓
Create schema
   ↓
Init models
   ↓
Run seeders
   ↓
Ready for API
```

---

# 🚀 Step 2 — Start API (`nd-api`)

## 🚀 Quick Commands

| Action             | Command                    |
| ------------------ | -------------------------- |
| Start API          | `nd-api`                   |
| Dev mode           | `nd-api -e dev`            |
| Custom port        | `nd-api -p 5000`           |
| Watch mode         | `nd-api -w`                |
| Dev + watch + port | `nd-api -e dev -p 5000 -w` |

---

## 🌍 Environment Loading

| Flag      | Result         |
| --------- | -------------- |
| `-e dev`  | `.env.dev`     |
| `-e prod` | `.env`         |
| none      | default `.env` |

---

## 🔁 API Startup Flow

```text id="apiflow"
main.ts
  ↓
startServer()
  ↓
setupDatabase()
  ↓
createApp()
  ↓
app.listen(PORT)
```

---

# 🧪 Full Local Development Workflow

## ⭐ Recommended Start Sequence

```powershell id="fullflow"
nd-db -s -e dev
nd-api -e dev -w -p 3000
```

---

## 💡 Why this order matters

* DB must exist before API starts
* API depends on Sequelize initialization
* avoids migration/runtime race conditions
* ensures consistent test data

---

# 🐞 Debugging Guide (VS Code)

## ⚠️ Key Rule

👉 Debugging requires:

* `--inspect`
* OR VS Code "Attach" configuration
* AND **watch mode recommended**

---

## 🚀 Option 1 — Attach Debugger (Recommended)

### Step 1: Start API in watch mode

```bash id="dbg1"
nd-api -e dev -w -p 3000
```

This ensures:

* TS reload support
* stable debug attach target

---

### Step 2: Start VS Code Attach

Use config:

```json id="dbg2"
{
  "name": "Attach",
  "type": "node",
  "request": "attach",
  "port": 9229
}
```

---

## 🚀 Option 2 — Launch Debug Mode

Run directly:

```json id="dbg3"
"Launch Express"
```

This uses:

```text id="dbg4"
--inspect=9229
```

---

## 🧪 Debug Seed DB

VS Code config:

```json id="dbg5"
{
  "name": "Debug Seed DB",
  "request": "launch",
  "runtimeExecutable": "node",
  "runtimeArgs": [
    "--inspect-brk",
    "--loader",
    "ts-node/esm"
  ],
  "args": [
    "src/Scripts/Migrations/seed_db.ts",
    "--create-db"
  ]
}
```

---

# 🔥 Debug Workflow Summary

## API Debug

```text id="dbgflow1"
nd-db -s -e dev
   ↓
nd-api -w -e dev
   ↓
VS Code Attach (9229)
```

---

## Seeder Debug

```text id="dbgflow2"
VS Code "Debug Seed DB"
   ↓
Break at first line (--inspect-brk)
   ↓
Step through seed logic
```

---

# ⚙️ Command Reference Summary

## 🗄 DB Commands

| Command    | Meaning             |
| ---------- | ------------------- |
| `-s`       | seed database       |
| `-d`       | drop database only  |
| `-e dev`   | use dev environment |
| `-cs test` | filter dataset      |

---

## 🚀 API Commands

| Command     | Meaning              |
| ----------- | -------------------- |
| `-e dev`    | load dev environment |
| `-p 3000`   | set port             |
| `-w`        | enable watch mode    |
| `--inspect` | enable debugging     |

---

# 🧠 Key Rules (Important)

### 1. DB always first

```text
nd-db → nd-api
```

### 2. Use watch mode for debugging

```text
- required for attach stability
```

### 3. `.env.dev` only triggers when:

```text
-e dev
```

### 4. Seeder must run via CLI

```text
seed_db_cli.ts → seedDatabase()
```

---

# 🎯 Recommended Dev Setup (Daily Workflow)

```powershell id="daily"
nd-db -s -e dev
nd-api -e dev -w -p 3000
```

Then attach debugger if needed.
