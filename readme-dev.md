# 🚀 ND API — Developer Quick Start

Lightweight guide for running the API + database locally.

---

# ⚡ 1. Recommended Startup Order

👉 Always run database first:

```text id="flow0"
1. nd-db (reset + seed database)
2. nd-api (start server)
3. attach debugger (optional)
```

---

# 🗄 2. Database Commands (nd-db)

## 📌 Quick Reference

| Action          | Command             |
| --------------- | ------------------- |
| Help            | `nd-db -h`          |
| Seed DB         | `nd-db -s`          |
| Reset + Seed    | `nd-db -s`          |
| Dev environment | `nd-db -s -e dev`   |
| Filter dataset  | `nd-db -s -cs test` |
| Drop DB only    | `nd-db -d`          |

---

## 🌍 Environment Behavior

| Env     | Config Loaded |
| ------- | ------------- |
| `dev`   | `.env.dev`    |
| `prod`  | `.env`        |
| default | `.env`        |

---

## 🔁 Typical DB Reset

```bash id="db1"
nd-db -s -e dev
```

Flow:

```text id="dbflow"
drop DB / tables
→ create schema
→ init models
→ run seeders
→ ready
```

---

# 🚀 3. API Commands (nd-api)

## 📌 Quick Reference

| Action      | Command                    |
| ----------- | -------------------------- |
| Start API   | `nd-api`                   |
| Dev mode    | `nd-api -e dev`            |
| Custom port | `nd-api -p 5000`           |
| Watch mode  | `nd-api -w`                |
| Dev + watch | `nd-api -e dev -w -p 3000` |

---

## 🌍 Environment Loading

| Flag      | Result           |
| --------- | ---------------- |
| `-e dev`  | loads `.env.dev` |
| `-e prod` | loads `.env`     |
| none      | default config   |

---

## 🔁 API Startup Flow

```text id="apiflow"
main.ts
 → startServer()
 → setupDatabase()
 → createApp()
 → app.listen(PORT)
```

---

# 🧪 4. Full Local Dev Workflow

## ⭐ Standard Setup

```powershell id="full"
nd-db -s -e dev
nd-api -e dev -w -p 3000
```

---

## 💡 Why This Order Matters

* DB must exist before API starts
* Sequelize depends on initialized schema
* avoids runtime/migration errors

---

# 🐞 5. Debugging Guide (VS Code)

## ⚠️ Rule

👉 Use **watch mode for attach debugging**

---

## 🚀 Option A — Attach Debugger (Recommended)

### Step 1: Start API

```bash id="dbg1"
nd-api -e dev -w
```

---

### Step 2: Attach VS Code Debugger

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

## 🚀 Option B — Launch Debug Mode

```json id="dbg3"
Launch Express
```

Uses:

```text id="dbg4"
--inspect=9229
```

---

## 🧪 Debug Seeder

Use VS Code config:

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

# ⚙️ 6. Command Cheat Sheet

## 🗄 DB

| Flag       | Meaning             |
| ---------- | ------------------- |
| `-s`       | seed database       |
| `-d`       | drop DB only        |
| `-e dev`   | use dev environment |
| `-cs test` | filter dataset      |

---

## 🚀 API

| Flag        | Meaning              |
| ----------- | -------------------- |
| `-e dev`    | load dev environment |
| `-p 3000`   | set port             |
| `-w`        | enable watch mode    |
| `--inspect` | enable debugging     |

---

# 🧠 7. Key Rules

### ✔ Always run DB first

```text id="rule1"
nd-db → nd-api
```

---

### ✔ Use watch mode for debugging

```text id="rule2"
required for attach stability
```

---

### ✔ Dev environment loads `.env.dev`

```text id="rule3"
only when -e dev is set
```

---

### ✔ Seeder runs via CLI only

```text id="rule4"
seed_db_cli.ts → seedDatabase()
```

---

# 🎯 8. Recommended Daily Workflow

```powershell id="daily"
nd-db -s -e dev
nd-api -e dev -w -p 3000
```

Then attach debugger if needed.

---

# 🧩 System Summary

```text id="arch"
nd-db → database ready
nd-api → server start
VS Code → debugger attach
```
