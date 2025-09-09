export type RaidStatus = "SCHEDULED" | "OPEN" | "CLOSED" | "ONGOING" | "FINISHED" | "CANCELLED";

export interface RaidStatusInfo {
  color: {
    // Tailwind CSS classes for web
    web: {
      background: string;
      text: string;
      border: string;
    };
    // Hex colors for Discord embeds
    discord: string;
  };
  emoji: string;
  label: string;
}

export const RAID_STATUS_INFO: Record<RaidStatus, RaidStatusInfo> = {
  SCHEDULED: {
    color: {
      web: {
        background: "bg-blue-500",
        text: "text-blue-100",
        border: "border-blue-500",
      },
      discord: "#3b82f6",
    },
    emoji: "🟡",
    label: "Scheduled",
  },
  OPEN: {
    color: {
      web: {
        background: "bg-green-500",
        text: "text-green-100",
        border: "border-green-500",
      },
      discord: "#10b981",
    },
    emoji: "🟢",
    label: "Open",
  },
  CLOSED: {
    color: {
      web: {
        background: "bg-red-500",
        text: "text-red-100",
        border: "border-red-500",
      },
      discord: "#ef4444",
    },
    emoji: "🔴",
    label: "Closed",
  },
  ONGOING: {
    color: {
      web: {
        background: "bg-yellow-500",
        text: "text-yellow-100",
        border: "border-yellow-500",
      },
      discord: "#eab308",
    },
    emoji: "▶️",
    label: "Ongoing",
  },
  FINISHED: {
    color: {
      web: {
        background: "bg-gray-500",
        text: "text-gray-100",
        border: "border-gray-500",
      },
      discord: "#6b7280",
    },
    emoji: "👑",
    label: "Finished",
  },
  CANCELLED: {
    color: {
      web: {
        background: "bg-red-500",
        text: "text-red-100",
        border: "border-red-500",
      },
      discord: "#ef4444",
    },
    emoji: "❌",
    label: "Cancelled",
  },
};
