import type { Raid, RaidSlot, RaidStatus } from "@albion-raid-manager/types";

import { createContext, useContext, type ReactNode } from "react";

import { toast } from "sonner";

import { useDeleteRaidMutation, useUpdateRaidMutation } from "@/store/raids";

interface RaidContextValue {
  raid: Raid;
  handleCopyRaidLink: () => void;
  handleDeleteRaid: () => void;
  handleRaidSlotCreate: (slot: Omit<RaidSlot, "id" | "createdAt" | "joinedAt">) => void;
  handleRaidSlotDelete: (slotId: string) => void;
  handleRaidSlotUpdate: (slotId: string, updates: Partial<RaidSlot>) => void;
  handleShareRaid: () => void;
  handleUpdateRaidNotes: (notes: string) => void;
  handleUpdateRaidStatus: (status: RaidStatus) => void;
  handleUpdateRaid: (updates: { title?: string; description?: string; date?: Date; location?: string }) => void;
  canEditComposition: boolean;
  canManageRaid: boolean;
  isFlexRaid: boolean;
  currentSlotCount: number;
  maxSlots: number;
  canAddSlots: boolean;
}

const RaidContext = createContext<RaidContextValue | undefined>(undefined);

interface RaidProviderProps {
  raid: Raid;
  children: ReactNode;
  serverId: string;
  raidId: string;
  onSlotUpdate?: (slotId: string, updates: Partial<RaidSlot>) => void;
  onSlotDelete?: (slotId: string) => void;
  onSlotCreate?: (slot: Omit<RaidSlot, "id" | "createdAt" | "joinedAt">) => void;
}

export function RaidProvider({ raid, children, serverId, raidId }: RaidProviderProps) {
  const [updateRaid] = useUpdateRaidMutation();
  const [deleteRaid] = useDeleteRaidMutation();

  const canManageRaid = true; // TODO: Use the permission system to determine if the user has permission to edit raid
  const canEditComposition =
    canManageRaid && (raid.status === "SCHEDULED" || raid.status === "OPEN" || raid.status === "CLOSED");
  const isFlexRaid = raid.type === "FLEX";
  const currentSlotCount = raid.slots?.length || 0;
  const maxSlots = raid.maxPlayers || 0;
  const canAddSlots = isFlexRaid && (maxSlots === 0 || currentSlotCount < maxSlots);

  const handleUpdateRaidStatus = async (status: RaidStatus) => {
    try {
      await updateRaid({
        params: {
          serverId,
          raidId,
        },
        body: { status },
      }).unwrap();

      toast.success("Raid status updated successfully", {
        description: `Raid status changed to ${status}`,
      });
    } catch {
      toast.error("Failed to update raid status", {
        description: "There was an error updating the raid status. Please try again.",
      });
    }
  };

  const handleUpdateRaidNotes = async (notes: string) => {
    try {
      await updateRaid({
        params: {
          serverId,
          raidId,
        },
        body: { note: notes },
      }).unwrap();

      toast.success("Raid notes updated successfully");
    } catch {
      toast.error("Failed to update raid notes", {
        description: "There was an error updating the raid notes. Please try again.",
      });
    }
  };

  const handleUpdateRaid = async (updates: {
    title?: string;
    description?: string;
    date?: Date;
    location?: string;
  }) => {
    try {
      await updateRaid({
        params: {
          serverId,
          raidId,
        },
        body: updates,
      }).unwrap();

      toast.success("Raid updated successfully", {
        description: "Your raid details have been updated.",
      });
    } catch {
      toast.error("Failed to update raid", {
        description: "There was an error updating the raid. Please try again.",
      });
    }
  };

  const handleCopyRaidLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Raid link copied to clipboard");
  };

  const handleShareRaid = () => {
    if (navigator.share) {
      navigator.share({
        title: raid.title,
        text: `Join ${raid.title} - ${new Date(raid.date).toLocaleString()}`,
        url: window.location.href,
      });
    } else {
      handleCopyRaidLink();
    }
  };

  const handleDeleteRaid = async () => {
    if (!window.confirm(`Are you sure you want to delete "${raid.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteRaid({
        params: {
          serverId,
          raidId,
        },
      }).unwrap();

      toast.success("Raid deleted successfully", {
        description: `"${raid.title}" has been permanently deleted.`,
      });

      // Navigate back to raids list
      window.location.href = `/dashboard/${serverId}/raids`;
    } catch {
      toast.error("Failed to delete raid", {
        description: "There was an error deleting the raid. Please try again.",
      });
    }
  };

  const handleRaidSlotCreate = (slot: Omit<RaidSlot, "id" | "createdAt" | "joinedAt">) => {
    console.log("handleRaidSlotCreate", slot);
  };

  const handleRaidSlotDelete = (slotId: string) => {
    console.log("handleRaidSlotDelete", slotId);
  };

  const handleRaidSlotUpdate = (slotId: string, updates: Partial<RaidSlot>) => {
    console.log("handleRaidSlotUpdate", slotId, updates);
  };

  const value: RaidContextValue = {
    raid,
    handleCopyRaidLink,
    handleDeleteRaid,
    handleRaidSlotCreate,
    handleRaidSlotDelete,
    handleRaidSlotUpdate,
    handleShareRaid,
    handleUpdateRaidNotes,
    handleUpdateRaidStatus,
    handleUpdateRaid,
    canEditComposition,
    canManageRaid,
    isFlexRaid,
    currentSlotCount,
    maxSlots,
    canAddSlots,
  };

  return <RaidContext.Provider value={value}>{children}</RaidContext.Provider>;
}

export function useRaidContext() {
  const context = useContext(RaidContext);
  if (context === undefined) {
    throw new Error("useRaidContext must be used within a RaidProvider");
  }
  return context;
}
