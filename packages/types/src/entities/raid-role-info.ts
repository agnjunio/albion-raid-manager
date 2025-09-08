import { RaidRole } from "@albion-raid-manager/types";

export type RaidRoleInfo = {
  role: RaidRole;
  emoji: string;
  displayName: string;
  description: string;
};

export const RAID_ROLE_INFO: RaidRoleInfo[] = [
  {
    role: "CALLER",
    emoji: "🧠",
    displayName: "Caller",
    description: "Raid leader and strategist",
  },
  {
    role: "TANK",
    emoji: "🛡️",
    displayName: "Tank",
    description: "Frontline damage absorber",
  },
  {
    role: "HEALER",
    emoji: "💚",
    displayName: "Healer",
    description: "Support and healing specialist",
  },
  {
    role: "MELEE_DPS",
    emoji: "⚔️",
    displayName: "Melee DPS",
    description: "Close combat damage dealer",
  },
  {
    role: "RANGED_DPS",
    emoji: "🏹",
    displayName: "Ranged DPS",
    description: "Long-range damage dealer",
  },
  {
    role: "SUPPORT",
    emoji: "💊",
    displayName: "Support",
    description: "Utility and buff specialist",
  },
  {
    role: "BATTLEMOUNT",
    emoji: "🐎",
    displayName: "Battlemount",
    description: "Mounted combat specialist",
  },
];

// Convenience function to get the raid role info for a given role
export function getRaidRoleInfo(role?: RaidRole): RaidRoleInfo | null {
  return RAID_ROLE_INFO.find((rri) => rri.role === role) || null;
}

// Get emoji for a role, with fallback to default
export function getRaidRoleEmoji(role?: RaidRole | null): string {
  if (!role) return "❔";
  const roleInfo = getRaidRoleInfo(role);
  return roleInfo?.emoji || "❔";
}
