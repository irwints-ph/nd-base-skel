# Development Guide

## Debugging

### Run App in Debug Mode

```bash
npx tsx --inspect --watch src/main.ts
```

### Debug Including Startup Breakpoint

Starts paused and waits for the debugger to attach.

```bash
node --inspect-brk --watch node_modules/tsx/dist/cli.mjs src/main.ts
```

After running the command:

1. Open VS Code
2. Go to **Run and Debug**
3. Click **Attach**

> Re-attach after code changes if needed.

---

## Debug Seeder

Use this when you want full control over when execution starts.

```bash
node --inspect-brk node_modules/tsx/dist/cli.mjs src/Scripts/Migrations/seed_db_cli.ts --create-db
```

Then:

1. Open **Run and Debug**
2. Click **Attach**

---

# Running the Project

## Start Development Server

```bash
npx tsx src/main.ts
```

Or:

```bash
npm run dev
```

---

## Run Database Seeder

```bash
npx tsx src/Scripts/Migrations/seed_db.ts --create-db
```

or

```bash
npx tsx src/Scripts/Migrations/seed_db_cli.ts --create-db
```

---

# Adding a New Table

Update the following files when adding a new database table:

1. `src/04-Infrastructure/Persistence/Models/types.ts`
2. `src/04-Infrastructure/Persistence/Models/Base/index.ts`
3. `src/Scripts/Migrations/db_setup.ts`
4. `src/04-Infrastructure/Core/InitModels.ts`

---

# Git Utilities

## Ignore Local Changes (Keep File Tracked)

```bash
git update-index --skip-worktree node-app.sqlite3
git update-index --skip-worktree .vscode/settings.json
git update-index --skip-worktree user.http
```

---

## Find Files in Repository

```bash
git ls-files -v | findstr settings.json
git ls-files -v | findstr RolesRoutes.ts
```

---

## Remove Files From Repository But Keep Local Copy

```bash
git rm --cached user.http
git rm --cached node-app.sqlite3
git rm --cached .vscode/settings.json
git rm --cached node-app.sqlite3-journal
git rm --cached node-app.sqlite3-wal
```

---

# Git File Tracking Options

| Feature                       | `assume-unchanged`       | `--no-assume-unchanged`                         | `skip-worktree`    | `--no-skip-worktree`                         | `git rm --cached`      |
| ----------------------------- | ------------------------ | ----------------------------------------------- | ------------------ | -------------------------------------------- | ---------------------- |
| Ignore local changes          | ✔️                       | ❌                                               | ✔️                 | ❌                                            | ❌                      |
| Recommended for long-term use | ❌                        | ✔️                                              | ✔️                 | ✔️                                           | ✔️                     |
| Primary use case              | Performance optimization | Re-enable tracking                              | Local config/files | Re-enable tracking                           | Remove from repository |
| File remains in repository    | ✔️                       | ✔️                                              | ✔️                 | ✔️                                           | ❌                      |
| Local file preserved          | ✔️                       | ✔️                                              | ✔️                 | ✔️                                           | ✔️                     |
| Changes pushed to remote      | ❌                        | ✔️                                              | ❌                  | ✔️                                           | ❌                      |
| Revert command                | —                        | `git update-index --no-assume-unchanged <file>` | —                  | `git update-index --no-skip-worktree <file>` | —                      |

---

# Git Workflow

```bash
git add .
git commit -m "Update comment"
git push
```

---

# TypeScript Path Aliases

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@Api/*": ["01-Api/*"],
      "@Application/*": ["02-Application/*"],
      "@Domain/*": ["03-Domain/*"],
      "@Infrastructure/*": ["04-Infrastructure/*"]
    }
  }
}
```

---

# Seeder Commands

## Using ts-node

```bash
npx ts-node src/Scripts/Migrations/seed_db.ts -- --create-db
```

With path aliases:

```bash
npx ts-node -P tsconfig.json -r tsconfig-paths/register src/Scripts/Migrations/seed_db.ts --create-db
```

---

## Using npm Scripts

```bash
npm run seed
```

```bash
npm run seed -- --create-db
```

---

# Debug Seeder with Breakpoint

```bash
node --inspect-brk node_modules/tsx/dist/cli.mjs src/Scripts/Migrations/seed_db.ts --create-db
```

Then attach using:

> Run and Debug → Attach

---

# Package Installation

## Database Packages

```bash
npm install sequelize sequelize-typescript pg pg-hstore
```

## Optional Packages

```bash
# npm install cors
# npm install -D @types/cors
npm install --save-dev @types/nodemailer
```

---

# Windows Port Management

## Find Process Using Port 3000

```bash
netstat -ano | findstr :3000
```

## Kill Process by PID

```bash
taskkill /f /pid 28760
```

## List Running Node Processes

```bash
tasklist /FI "IMAGENAME eq node.exe"
```

---

# Running Tests

## API Tests

```bash
npx jest --config jest.config.cjs src/05-Test/api.test.ts
```

## Component Tests

```bash
npx jest --config jest.config.cjs Button.test.tsx
```

---

## Suggested Improvements

A few things that would further improve the README:

* Add a **Project Setup** section (`npm install`, `.env`, database setup)
* Add a **Folder Structure** overview
* Add sample `.env` variables
* Add VS Code `launch.json` examples
* Separate:

  * App commands
  * Database commands
  * Git utilities
  * Testing commands
* Standardize naming:

  * `seed_db.ts`
  * `seed_db_cli.ts`
  * `db_setup.ts`

You could also turn this into:

* `README.md` → high-level project setup
* `docs/development.md` → developer workflows
* `docs/debugging.md` → debugging guide
* `docs/database.md` → migrations/seeding guide
