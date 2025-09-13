import type { RaidRole } from "@albion-raid-manager/types";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { getContentTypeInfo } from "@albion-raid-manager/types/entities";
import { toast } from "sonner";

import { type EditingSlot } from "../helpers/raid-composition-utils";

import { useRaidContext } from "./raid-context";

interface RaidSlotContextValue {
  // State
  editingSlot: EditingSlot | null;
  isAddingSlot: boolean;
  isReordering: boolean;
  currentSlotCount: number;

  // Actions
  startEditingSlot: (slot: {
    id: string;
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
    weapon?: string | null;
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
    weapon?: string | null;
  }) => void;
  deleteSlot: (slotId: string) => void;
  reorderSlots: (activeId: string, overId: string) => void;

  // Conditions
  canEditRaidSlot: boolean;
  canAddRaidSlot: boolean;
  canDeleteRaidSlot: boolean;
}

const RaidSlotContext = createContext<RaidSlotContextValue | undefined>(undefined);

interface RaidSlotProviderProps {
  children: ReactNode;
}

export function RaidSlotProvider({ children }: RaidSlotProviderProps) {
  const { raid, handleRaidSlotCreate, handleRaidSlotUpdate, handleRaidSlotDelete, canManageRaid } = useRaidContext();

  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const contentTypeInfo = useMemo(() => getContentTypeInfo(raid?.contentType), [raid?.contentType]);
  const currentSlotCount = useMemo(() => raid?.slots?.length || 0, [raid?.slots]);

  const canEditRaidSlot = useMemo(
    () =>
      Boolean(
        canManageRaid && raid && (raid.status === "SCHEDULED" || raid.status === "OPEN" || raid.status === "CLOSED"),
      ),
    [canManageRaid, raid],
  );
  const canAddRaidSlot = useMemo(
    () =>
      Boolean(canEditRaidSlot && (!contentTypeInfo.partySize?.max || currentSlotCount < contentTypeInfo.partySize.max)),
    [canEditRaidSlot, contentTypeInfo.partySize?.max, currentSlotCount],
  );
  const canDeleteRaidSlot = useMemo(
    () =>
      Boolean(canEditRaidSlot && (!contentTypeInfo.partySize?.min || currentSlotCount > contentTypeInfo.partySize.min)),
    [canEditRaidSlot, contentTypeInfo.partySize?.min, currentSlotCount],
  );

  const startEditingSlot = (slot: {
    id: string;
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
    weapon?: string | null;
  }) => {
    if (!canEditRaidSlot) {
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
      weapon: slot.weapon || "",
    });
  };

  const startAddingSlot = () => {
    if (!canAddRaidSlot) {
      toast.error("Cannot add slot", {
        description: "Cannot add more slots. Maximum party size reached or raid is not editable.",
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
    weapon?: string | null;
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
        comment: slotData.comment?.trim() || null,
        userId: slotData.userId,
        weapon: slotData.weapon,
      });
      setEditingSlot(null);
    } else if (isAddingSlot) {
      // Create new slot
      handleRaidSlotCreate({
        name: slotData.name.trim(),
        role: slotData.role || null,
        comment: slotData.comment?.trim() || null,
        weapon: slotData.weapon || null,
        raidId: raid?.id || "",
        userId: slotData.userId || null,
      });
      setIsAddingSlot(false);
    }
  };

  const deleteSlot = (slotId: string) => {
    if (!canDeleteRaidSlot) {
      toast.error("Cannot delete slot", {
        description: "Cannot delete slots. Minimum party size reached or raid is not editable.",
      });
      return;
    }

    if (!window.confirm("Are you sure you want to delete this slot?")) {
      return;
    }

    handleRaidSlotDelete(slotId);
  };

  const reorderSlots = async (activeId: string, overId: string) => {
    if (!canEditRaidSlot) {
      toast.error("Cannot reorder slots", {
        description: "Raid composition can only be edited when the raid is in SCHEDULED, OPEN, or CLOSED status.",
      });
      return;
    }

    // Sort slots by order to match the UI
    const slots = [...(raid?.slots || [])].sort((a, b) => a.order - b.order);
    const activeIndex = slots.findIndex((slot) => slot.id === activeId);
    const overIndex = slots.findIndex((slot) => slot.id === overId);

    if (activeIndex === -1 || overIndex === -1) {
      return;
    }

    // Set loading state
    setIsReordering(true);

    try {
      await handleRaidSlotUpdate(activeId, { order: overIndex });
    } catch (error) {
      console.error("Failed to reorder slots:", error);
      toast.error("Failed to reorder slots", {
        description: "Please try again.",
      });
    } finally {
      // Clear loading state
      setIsReordering(false);
    }
  };

  const value: RaidSlotContextValue = {
    // State
    editingSlot,
    isAddingSlot,
    isReordering,
    currentSlotCount,

    // Actions
    startEditingSlot,
    startAddingSlot,
    cancelEditing,
    cancelAdding,

    // CRUD operations
    saveSlot,
    deleteSlot,
    reorderSlots,

    // Conditions
    canEditRaidSlot,
    canAddRaidSlot,
    canDeleteRaidSlot,
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
