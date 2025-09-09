import type { RaidRole, RaidSlot } from "@albion-raid-manager/types";

// Simple role icons and colors
export const getRoleIcon = (role: RaidRole | "UNASSIGNED") => {
  const icons = {
    TANK: "🛡️",
    HEALER: "💚",
    RANGED_DPS: "🏹",
    MELEE_DPS: "⚔️",
    SUPPORT: "🔮",
    CALLER: "📢",
    BATTLEMOUNT: "🐎",
    UNASSIGNED: "❓",
  };
  return icons[role] || "❓";
};

export const getRoleColor = (role: RaidRole | "UNASSIGNED") => {
  const colors = {
    TANK: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    HEALER:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
    RANGED_DPS: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
    MELEE_DPS:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
    SUPPORT:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
    CALLER:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
    BATTLEMOUNT:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
    UNASSIGNED: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800",
  };
  return colors[role] || colors.UNASSIGNED;
};

export const ROLE_OPTIONS: { value: RaidRole; label: string }[] = [
  { value: "CALLER", label: "Caller" },
  { value: "TANK", label: "Tank" },
  { value: "HEALER", label: "Healer" },
  { value: "SUPPORT", label: "Support" },
  { value: "RANGED_DPS", label: "Ranged DPS" },
  { value: "MELEE_DPS", label: "Melee DPS" },
  { value: "BATTLEMOUNT", label: "Battlemount" },
];

export interface EditingSlot {
  id: string;
  name: string;
  role?: RaidRole;
  comment?: string;
}

export const roleOrder = ["CALLER", "TANK", "HEALER", "SUPPORT", "RANGED_DPS", "MELEE_DPS", "BATTLEMOUNT", "UNASSIGNED"];

export const groupSlotsByRole = (slots: RaidSlot[]) => {
  return slots.reduce(
    (acc, slot) => {
      const role = slot.role || "UNASSIGNED";
      if (!acc[role]) acc[role] = [];
      acc[role].push(slot);
      return acc;
    },
    {} as Record<string, RaidSlot[]>,
  );
};
