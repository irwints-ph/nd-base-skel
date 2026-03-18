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
### Add table tobe created
1. src/04-Infrastructure/Persistence/Models/types.ts
2. src/04-Infrastructure/Persistence/Models/Base/index.ts
3. src/Scripts/Migrations/db_setup.ts
4. src/04-Infrastructure/Core/InitModels.ts


Then run attach
src
├── 01-Api
│   ├── Controllers
│   │   ├── Auth
│   │   │   ├── AuthController.ts
│   │   │   ├── RoleController.ts
│   │   │   └── ModuleController.ts
│   │   │
│   │   └── Users
│   │       └── UserController.ts
│   │
│   ├── Middleware
│   │   ├── AuthMiddleware.ts
│   │   ├── ErrorMiddleware.ts
│   │   └── ValidationMiddleware.ts
│   │
│   └── Routes
│       ├── AuthRoutes.ts
│       └── UserRoutes.ts
│
├── 02-Application
│   ├── Command
│   │   ├── Auth
│   │   │   ├── Module
│   │   │   │   ├── BuildModuleService.ts
│   │   │   │   └── CreateModuleService.ts
│   │   │   │
│   │   │   ├── Role
│   │   │   │   └── CreateRoleService.ts
│   │   │   │
│   │   │   ├── RoleModule
│   │   │   │   └── BuildRoleModuleService.ts
│   │   │   │
│   │   │   └── RoleUser
│   │   │       └── BuildRoleUserService.ts
│   │   │
│   │   └── Base
│   │       └── Users
│   │           └── CreateUserService.ts
│   │
│   ├── Mappers
│   │   ├── Auth
│   │   │   ├── ModuleMapper.ts
│   │   │   ├── RoleMapper.ts
│   │   │   ├── RoleModuleMapper.ts
│   │   │   └── RoleUserMapper.ts
│   │   │
│   │   └── Base
│   │       ├── ContactMapper.ts
│   │       ├── UserMapper.ts
│   │       └── UserProfileMapper.ts
│   │
│   └── Security
│       └── IPasswordHasher.ts
│
├── 03-Domain
│   ├── Entities
│   │   ├── Auth
│   │   │   ├── Module.ts
│   │   │   ├── Role.ts
│   │   │   ├── RoleModule.ts
│   │   │   └── RoleUser.ts
│   │   │
│   │   └── Base
│   │       ├── AuditLog.ts
│   │       ├── Otp.ts
│   │       └── User
│   │           ├── Contact.ts
│   │           ├── Profile.ts
│   │           ├── Sso.ts
│   │           └── User.ts
│   │
│   └── Interfaces
│       ├── IModuleRepository.ts
│       ├── IRoleRepository.ts
│       └── IUserRepository.ts
│
├── 04-Infrastructure
│   ├── Dependencies.ts
│   │
│   ├── Auth
│   │   └── BcryptPasswordHasher.ts
│   │
│   ├── Core
│   │   ├── AppTime.ts
│   │   ├── Config.ts
│   │   ├── ConfigLoader.ts
│   │   ├── DatabaseSettings.ts
│   │   ├── JWTSettings.ts
│   │   ├── Logger.ts
│   │   └── PasswordPolicySettings.ts
│   │
│   └── Persistence
│       ├── AppDBContext.ts
│       │
│       ├── Models
│       │   ├── Auth
│       │   │   ├── ModuleMstr.ts
│       │   │   ├── RoleMstr.ts
│       │   │   ├── RoleModuleMstr.ts
│       │   │   └── RoleUserMstr.ts
│       │   │
│       │   ├── Base
│       │   │   ├── UserMstr.ts
│       │   │   ├── ContactMstr.ts
│       │   │   ├── AuditLogs.ts
│       │   │   └── Otps.ts
│       │   │
│       │   └── Constants
│       │       ├── ContactTypes.ts
│       │       ├── DBNames.ts
│       │       └── UUIDColumn.ts
│       │
│       └── Repositories
│           └── UserRepository.ts
│
├── app.ts
├── server.ts
└── index.ts

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

npx ts-node src/Scripts/Migrations/seed_db.ts -- --create-db
npx ts-node -P tsconfig.json -r tsconfig-paths/register src/Scripts/Migrations/seed_db.ts --create-db

npm run seed
npm run seed -- --create-db

## Debug Seeder
```bash
node --inspect-brk node_modules/tsx/dist/cli.mjs src/Scripts/Migrations/seed_db.ts --create-db
```
> Run and Debug: Attach

npm install sequelize sequelize-typescript pg pg-hstore
<!-- npm install cors
npm install -D @types/cors -->
npm i --save-dev @types/nodemailer