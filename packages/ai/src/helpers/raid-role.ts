import { RaidRole } from "@albion-raid-manager/core/types";

// Helper function to map role names to RaidRole enum values
export function mapRoleNameToEnum(roleName: string): RaidRole {
  const roleMap: Record<string, RaidRole> = {
    TANK: "TANK",
    HEALER: "HEALER",
    SUPPORT: "SUPPORT",
    DPS: "RANGED_DPS", // Default DPS to ranged
    RANGED_DPS: "RANGED_DPS",
    MELEE_DPS: "MELEE_DPS",
    CALLER: "CALLER",
    BATTLEMOUNT: "BATTLEMOUNT",
    // Map common variations
    HEAL: "HEALER",
    HEALING: "HEALER",
    RANGED: "RANGED_DPS",
    MELEE: "MELEE_DPS",
  };

  const upperRoleName = roleName.toUpperCase();
  return roleMap[upperRoleName] || "RANGED_DPS"; // Default to ranged DPS if unknown
}
