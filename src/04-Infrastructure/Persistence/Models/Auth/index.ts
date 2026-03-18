// src/Infrastructure/Persistence/Models/Base/index.ts

import ModuleMstr from "./ModuleMstr.ts";
import RoleModuleMstr from "./RoleModuleMstr.ts";
import RoleMstr from "./RoleMstr.ts";
import RoleUserMstr from "./RoleUserMstr.ts";

// Optional: export all as a "dictionary" for dynamic access
export const BaseModels = {
  ModuleMstr,
  RoleModuleMstr,
  RoleMstr,
  RoleUserMstr,
};

// Also export individually for direct imports
export {
  ModuleMstr,
  RoleModuleMstr,
  RoleMstr,
  RoleUserMstr,
};
