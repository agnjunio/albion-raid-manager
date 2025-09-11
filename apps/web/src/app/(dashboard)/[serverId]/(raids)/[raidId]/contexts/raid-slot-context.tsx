import type { RaidRole } from "@albion-raid-manager/types";

import { createContext, useContext, useState, type ReactNode } from "react";

import { toast } from "sonner";

import { type EditingSlot } from "../helpers/raid-composition-utils";

import { useRaidContext } from "./raid-context";

interface RaidSlotContextValue {
  // State
  editingSlot: EditingSlot | null;
  isAddingSlot: boolean;

  // Actions
  startEditingSlot: (slot: {
    id: string;
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => void;
  startAddingSlot: () => void;
  cancelEditing: () => void;
  cancelAdding: () => void;

  // CRUD operations
  saveSlot: (slotData: {
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => void;
  deleteSlot: (slotId: string) => void;
}

const RaidSlotContext = createContext<RaidSlotContextValue | undefined>(undefined);

interface RaidSlotProviderProps {
  children: ReactNode;
}

export function RaidSlotProvider({ children }: RaidSlotProviderProps) {
  const {
    raid,
    handleRaidSlotCreate,
    handleRaidSlotUpdate,
    handleRaidSlotDelete,
    canEditComposition,
    canChangeRaidSlotCount,
  } = useRaidContext();

  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  const startEditingSlot = (slot: {
    id: string;
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => {
    if (!canEditComposition) {
      toast.error("Cannot edit slot", {
        description: "Raid composition can only be edited when the raid is in SCHEDULED, OPEN, or CLOSED status.",
      });
      return;
    }

    setEditingSlot({
      id: slot.id,
      name: slot.name,
      role: slot.role || undefined,
      comment: slot.comment || "",
      userId: slot.userId || null,
    });
  };

  const startAddingSlot = () => {
    if (!canEditComposition) {
      toast.error("Cannot add slot", {
        description: "Raid composition can only be edited when the raid is in SCHEDULED, OPEN, or CLOSED status.",
      });
      return;
    }

    setIsAddingSlot(true);
  };

  const cancelEditing = () => {
    setEditingSlot(null);
  };

  const cancelAdding = () => {
    setIsAddingSlot(false);
  };

  const saveSlot = (slotData: {
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => {
    if (!slotData.name.trim()) {
      toast.error("Slot name is required");
      return;
    }

    if (editingSlot) {
      // Update existing slot
      handleRaidSlotUpdate(editingSlot.id, {
        name: slotData.name.trim(),
        role: slotData.role,
        comment: slotData.comment?.trim() || undefined,
        userId: slotData.userId,
      });
      setEditingSlot(null);
    } else if (isAddingSlot) {
      // Create new slot
      handleRaidSlotCreate({
        name: slotData.name.trim(),
        role: slotData.role || null,
        comment: slotData.comment?.trim() || null,
        raidId: raid.id,
        userId: null,
      });
      setIsAddingSlot(false);
    }
  };

  const deleteSlot = (slotId: string) => {
    if (!canChangeRaidSlotCount) {
      toast.error("Cannot delete slot", {
        description: "Slot deletion is not allowed for this raid type.",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    handleRaidSlotDelete(slotId);
  };

  const value: RaidSlotContextValue = {
    // State
    editingSlot,
    isAddingSlot,

    // Actions
    startEditingSlot,
    startAddingSlot,
    cancelEditing,
    cancelAdding,

    // CRUD operations
    saveSlot,
    deleteSlot,
  };

  return <RaidSlotContext.Provider value={value}>{children}</RaidSlotContext.Provider>;
}

export function useRaidSlotContext() {
  const context = useContext(RaidSlotContext);
  if (context === undefined) {
    throw new Error("useRaidSlotContext must be used within a RaidSlotProvider");
  }
  return context;
}
