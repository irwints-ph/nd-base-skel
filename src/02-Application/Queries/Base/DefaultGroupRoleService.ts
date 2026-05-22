// ===================================================================
// 🟢 src/02-Application/Queries/Base/DefaultGroupRoleService
// ===================================================================

import { RoleAssignmentPolicy } from "#Domain/Services/RoleAssignmentPolicy.ts";
import { DefaultConfigurationRepository } from "#Infrastructure/Persistence/Repositories/Base/DefaultConfigurationRepository.ts";
import { logger } from "#Infrastructure/Core/Logger.ts";

export class DefaultGroupRoleService {
  private repo: DefaultConfigurationRepository;

  constructor(private sequelize: any) {
    this.repo = new DefaultConfigurationRepository();
  }

  async augmentRoles(roleIds: number[]): Promise<number[]> {
    try {
      const defaultRoles = await this.repo.getDefaultGroupRoles();
      return RoleAssignmentPolicy.includeDefaultGroupRoles(roleIds, defaultRoles);
    } catch (ex) {
      logger.warn(`❌ get_default_group_roles failed: ${ex}`);
      return roleIds;
    }
  }
}
