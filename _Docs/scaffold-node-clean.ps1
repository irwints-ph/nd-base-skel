# ================================
# Node + Express + TS Clean Architecture Scaffold
# ================================

$base = "src"

$folders = @(
    # 01-Api
    "01-Api/Controllers/Auth",
    "01-Api/Controllers/Users",
    "01-Api/Middleware",
    "01-Api/Routes",

    # 02-Application
    "02-Application/Command/Auth/Module",
    "02-Application/Command/Auth/Role",
    "02-Application/Command/Auth/RoleModule",
    "02-Application/Command/Auth/RoleUser",
    "02-Application/Command/Base/Users",
    "02-Application/Mappers/Auth",
    "02-Application/Mappers/Base",
    "02-Application/Security",

    # 03-Domain
    "03-Domain/Entities/Auth",
    "03-Domain/Entities/Base/User",
    "03-Domain/Interfaces",

    # 04-Infrastructure
    "04-Infrastructure/Auth",
    "04-Infrastructure/Core",
    "04-Infrastructure/Persistence/Models/Auth",
    "04-Infrastructure/Persistence/Models/Base",
    "04-Infrastructure/Persistence/Models/Constants",
    "04-Infrastructure/Persistence/Repositories"
)

$files = @(
    # Api
    "01-Api/Controllers/Auth/AuthController.ts",
    "01-Api/Controllers/Auth/RoleController.ts",
    "01-Api/Controllers/Auth/ModuleController.ts",
    "01-Api/Controllers/Users/UserController.ts",
    "01-Api/Middleware/AuthMiddleware.ts",
    "01-Api/Middleware/ErrorMiddleware.ts",
    "01-Api/Middleware/ValidationMiddleware.ts",
    "01-Api/Routes/AuthRoutes.ts",
    "01-Api/Routes/UserRoutes.ts",

    # Application Commands
    "02-Application/Command/Auth/Module/BuildModuleService.ts",
    "02-Application/Command/Auth/Module/CreateModuleService.ts",
    "02-Application/Command/Auth/Role/CreateRoleService.ts",
    "02-Application/Command/Auth/RoleModule/BuildRoleModuleService.ts",
    "02-Application/Command/Auth/RoleUser/BuildRoleUserService.ts",
    "02-Application/Command/Base/Users/CreateUserService.ts",

    # Application Mappers
    "02-Application/Mappers/Auth/ModuleMapper.ts",
    "02-Application/Mappers/Auth/RoleMapper.ts",
    "02-Application/Mappers/Auth/RoleModuleMapper.ts",
    "02-Application/Mappers/Auth/RoleUserMapper.ts",
    "02-Application/Mappers/Base/ContactMapper.ts",
    "02-Application/Mappers/Base/UserMapper.ts",
    "02-Application/Mappers/Base/UserProfileMapper.ts",

    # Application Security
    "02-Application/Security/IPasswordHasher.ts",

    # Domain Entities
    "03-Domain/Entities/Auth/Module.ts",
    "03-Domain/Entities/Auth/Role.ts",
    "03-Domain/Entities/Auth/RoleModule.ts",
    "03-Domain/Entities/Auth/RoleUser.ts",
    "03-Domain/Entities/Base/AuditLog.ts",
    "03-Domain/Entities/Base/Otp.ts",
    "03-Domain/Entities/Base/User/User.ts",
    "03-Domain/Entities/Base/User/Profile.ts",
    "03-Domain/Entities/Base/User/Contact.ts",
    "03-Domain/Entities/Base/User/Sso.ts",

    # Domain Interfaces
    "03-Domain/Interfaces/IModuleRepository.ts",
    "03-Domain/Interfaces/IRoleRepository.ts",
    "03-Domain/Interfaces/IUserRepository.ts",

    # Infrastructure
    "04-Infrastructure/Dependencies.ts",
    "04-Infrastructure/Auth/BcryptPasswordHasher.ts",
    "04-Infrastructure/Core/AppTime.ts",
    "04-Infrastructure/Core/Config.ts",
    "04-Infrastructure/Core/ConfigLoader.ts",
    "04-Infrastructure/Core/DatabaseSettings.ts",
    "04-Infrastructure/Core/JWTSettings.ts",
    "04-Infrastructure/Core/Logger.ts",
    "04-Infrastructure/Core/PasswordPolicySettings.ts",

    # Persistence
    "04-Infrastructure/Persistence/AppDBContext.ts",
    "04-Infrastructure/Persistence/Models/Auth/ModuleMstr.ts",
    "04-Infrastructure/Persistence/Models/Auth/RoleMstr.ts",
    "04-Infrastructure/Persistence/Models/Auth/RoleModuleMstr.ts",
    "04-Infrastructure/Persistence/Models/Auth/RoleUserMstr.ts",
    "04-Infrastructure/Persistence/Models/Base/UserMstr.ts",
    "04-Infrastructure/Persistence/Models/Base/ContactMstr.ts",
    "04-Infrastructure/Persistence/Models/Base/AuditLogs.ts",
    "04-Infrastructure/Persistence/Models/Base/Otps.ts",
    "04-Infrastructure/Persistence/Models/Constants/ContactTypes.ts",
    "04-Infrastructure/Persistence/Models/Constants/DBNames.ts",
    "04-Infrastructure/Persistence/Models/Constants/UUIDColumn.ts",
    "04-Infrastructure/Persistence/Repositories/UserRepository.ts",

    # App Entry
    "app.ts",
    "server.ts",
    "index.ts"
)

# Create base src folder
New-Item -ItemType Directory -Path $base -Force | Out-Null

# Create folders
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path (Join-Path $base $folder) -Force | Out-Null
}

# Create files
foreach ($file in $files) {
    $fullPath = Join-Path $base $file
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType File -Path $fullPath -Force | Out-Null
    }
}

Write-Host "✅ Node + Express + TypeScript Clean Architecture scaffold created successfully!"
