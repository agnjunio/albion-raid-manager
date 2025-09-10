import type { RaidRole } from "@albion-raid-manager/types";

import { useState } from "react";

import { faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useRaidContext } from "../contexts/raid-context";
import { type EditingSlot } from "../helpers/raid-composition-utils";

import { RaidCompositionGridView } from "./raid-composition-grid-view";
import { RaidCompositionListView } from "./raid-composition-list-view";
import { RaidSlotSheet } from "./raid-slot-sheet";
import { ViewToggle, type ViewMode } from "./view-toggle";

export function RaidComposition() {
  const {
    raid,
    handleRaidSlotUpdate,
    handleRaidSlotDelete,
    handleRaidSlotCreate,
    canEditComposition,
    isFlexRaid,
    currentSlotCount,
    maxSlots,
    canAddSlots,
  } = useRaidContext();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  const handleSaveSlot = (slotData: {
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => {
    if (!editingSlot) return;

    if (!slotData.name.trim()) {
      toast.error("Slot name is required");
      return;
    }

    handleRaidSlotUpdate(editingSlot.id, {
      name: slotData.name.trim(),
      role: slotData.role,
      comment: slotData.comment?.trim() || undefined,
      userId: slotData.userId,
    });

    setEditingSlot(null);
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      handleRaidSlotDelete(slotId);
    }
  };

  const handleAddSlot = (slotData: {
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => {
    if (!slotData.name.trim()) {
      toast.error("Slot name is required");
      return;
    }

    handleRaidSlotCreate({
      name: slotData.name.trim(),
      role: slotData.role || null,
      comment: slotData.comment?.trim() || null,
      raidId: raid.id,
      userId: null,
    });

    setIsAddingSlot(false);
  };

  const handleCancelAdd = () => {
    setIsAddingSlot(false);
  };

  const handleEditSlot = (slot: {
    id: string;
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => {
    setEditingSlot({
      id: slot.id,
      name: slot.name,
      role: slot.role || undefined,
      comment: slot.comment || "",
      userId: slot.userId || null,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <FontAwesomeIcon icon={faUser} className="text-primary h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Raid Composition</h2>
              </div>
              {canAddSlots && (
                <p className="text-muted-foreground text-sm">
                  {currentSlotCount} / {maxSlots === 0 ? "∞" : maxSlots} slots
                </p>
              )}
            </div>
          </CardTitle>
          <div className="flex items-center gap-3">
            <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
            {canEditComposition && canAddSlots && (
              <Button
                onClick={() => setIsAddingSlot(true)}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                Add Slot
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!canEditComposition && (
          <div className="mb-4 rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <p className="text-sm">
              Raid composition can only be edited when the raid is in SCHEDULED, OPEN, or CLOSED status.
            </p>
          </div>
        )}

        {/* Slots List */}
        <div className="space-y-4">
          {viewMode === "grid" ? (
            <RaidCompositionGridView
              editingSlot={editingSlot}
              onEditSlot={handleEditSlot}
              onSaveSlot={handleSaveSlot}
              onCancelEdit={handleCancelEdit}
              onDeleteSlot={handleDeleteSlot}
              setEditingSlot={setEditingSlot}
            />
          ) : (
            <RaidCompositionListView
              editingSlot={editingSlot}
              onEditSlot={handleEditSlot}
              onSaveSlot={handleSaveSlot}
              onCancelEdit={handleCancelEdit}
              onDeleteSlot={handleDeleteSlot}
              setEditingSlot={setEditingSlot}
            />
          )}

          {(!raid.slots || raid.slots.length === 0) && (
            <div className="py-12 text-center">
              <div className="text-muted-foreground mb-4 text-6xl">⚔️</div>
              <h3 className="mb-2 text-lg font-semibold">No Raid Slots</h3>
              <p className="text-muted-foreground">
                {isFlexRaid
                  ? "This flexible raid doesn't have any slots defined yet. Add slots to organize your raid composition."
                  : "This fixed raid doesn't have any slots defined yet."}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Add Slot Sheet */}
      <RaidSlotSheet isOpen={isAddingSlot} onClose={handleCancelAdd} mode="add" onSave={handleAddSlot} />
    </Card>
  );
}
