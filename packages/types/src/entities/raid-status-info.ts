export type RaidStatus = "SCHEDULED" | "OPEN" | "CLOSED" | "ONGOING" | "FINISHED" | "CANCELLED";

export interface RaidStatusInfo {
  color: string;
  emoji: string;
  label: string;
}

export const RAID_STATUS_INFO: Record<RaidStatus, RaidStatusInfo> = {
  SCHEDULED: {
    color: "#3b82f6",
    emoji: "🟡",
    label: "Scheduled",
  },
  OPEN: {
    color: "#10b981",
    emoji: "🟢",
    label: "Open",
  },
  CLOSED: {
    color: "#ef4444",
    emoji: "🔴",
    label: "Closed",
  },
  ONGOING: {
    color: "#eab308",
    emoji: "▶️",
    label: "Ongoing",
  },
  FINISHED: {
    color: "#6b7280",
    emoji: "👑",
    label: "Finished",
  },
  CANCELLED: {
    color: "#ef4444",
    emoji: "❌",
    label: "Cancelled",
  },
};
