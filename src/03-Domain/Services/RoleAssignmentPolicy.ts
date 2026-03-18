// ===================================================================
// 🧩 src/03-Domain/Services/RoleAssignmentPolicy.ts
// ===================================================================

export class RoleAssignmentPolicy {
  static includeDefaultGroupRoles(roleIds: number[], defaultRoles: number[]): number[] {
    const merged = [...roleIds, ...defaultRoles];
    // Deduplicate by converting to Set, then back to array
    return Array.from(new Set(merged));
  }
}