### Debug
```bash
npx tsx --inspect --watch src/main.ts

# Debug including start-up. Will start when play of > Run and Debug: Attach is clicked. Re-cick attac on code changes
node --inspect-brk --watch node_modules/tsx/dist/cli.mjs src/main.ts
```
## Debug Seeder - use this so that we have control when the code will start
```bash
node --inspect-brk node_modules/tsx/dist/cli.mjs src/Scripts/Migrations/seed_db.ts --create-db
```
> Run and Debug: Attach

### Run
## Seeder
```bash
npx tsx src/main.ts

# OR
npm run dev
```
## Seeder
```bash
npx tsx src/Scripts/Migrations/seed_db.ts --create-db
```
Then run attach

### Add table tobe created
1. src/04-Infrastructure/Persistence/Models/types.ts
2. src/04-Infrastructure/Persistence/Models/Base/index.ts
3. src/Scripts/Migrations/db_setup.ts
4. src/04-Infrastructure/Core/InitModels.ts


```bash
git update-index --skip-worktree node-app.sqlite3
git update-index --skip-worktree .vscode/settings.json
git update-index --skip-worktree user.http

### Find files on the remore rository 
git ls-files -v | findstr settings.json
git ls-files -v | findstr RolesRoutes.ts

git add .
git commit -m "Update User Routes"
git push

### This will delete files on the repo but not on local
git rm --cached user.http
git rm --cached node-app.sqlite3
git rm --cached .vscode/settings.json
git rm --cached node-app.sqlite3-journal
git rm --cached node-app.sqlite3-wal

```
### git feature

| Feature                  | `assume-unchanged` | `--no-assume-unchanged`                         | `skip-worktree`         | `--no-skip-worktree`                         | `git rm --cached`                                  |
| ------------------------ | ------------------ | ----------------------------------------------- | ----------------------- | -------------------------------------------- | -------------------------------------------------- |
| Ignore local changes     | ✔️                 | ❌                                               | ✔️                      | ❌                                            | ❌ (removes from tracking)                          |
| Safe for long-term use   | ❌                  | ✅                                               | ✅                       | ✅                                            | ✅ (if you want to remove it permanently from repo) |
| Used for                 | performance        | revert assumption                               | config/local-only files | revert skip-worktree                         | stop tracking files in repo                        |
| Stays in repo            | ✔️                 | ✔️                                              | ✔️                      | ✔️                                           | ❌ (removed from repo in next commit)               |
| Local file kept          | ✔️                 | ✔️                                              | ✔️                      | ✔️                                           | ✔️                                                 |
| Changes pushed to remote | ❌                  | ✔️                                              | ❌                       | ✔️                                           | ❌                                                  |
| Revert command           | n/a                | `git update-index --no-assume-unchanged <file>` | n/a                     | `git update-index --no-skip-worktree <file>` | n/a                                                |

### Alias Config in TS
```ts
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

```bash
npx ts-node src/Scripts/Migrations/seed_db.ts -- --create-db
npx ts-node -P tsconfig.json -r tsconfig-paths/register src/Scripts/Migrations/seed_db.ts --create-db

npm run seed
npm run seed -- --create-db
```

## Debug Seeder
```bash
node --inspect-brk node_modules/tsx/dist/cli.mjs src/Scripts/Migrations/seed_db.ts --create-db
```
> Run and Debug: Attach

```bash
npm install sequelize sequelize-typescript pg pg-hstore
# npm install cors
# npm install -D @types/cors
npm i --save-dev @types/nodemailer
```
