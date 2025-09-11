import type { RaidSlot } from "@albion-raid-manager/types";

import { useMemo } from "react";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { useRaidContext } from "../contexts/raid-context";
import { useRaidSlotContext } from "../contexts/raid-slot-context";

import { GridRaidSlotCard, ListRaidSlotCard } from "./raid-slot-card";
import { RaidSlotSheet } from "./raid-slot-sheet";

interface RaidCompositionListProps {
  viewMode: "list" | "grid";
}

export function RaidCompositionList({ viewMode }: RaidCompositionListProps) {
  const { raid } = useRaidContext();
  const { editingSlot, saveSlot, cancelEditing, reorderSlots, isReordering } = useRaidSlotContext();

  const slots = useMemo(() => {
    if (!raid.slots || raid.slots.length === 0) return [];
    const slots = [...raid.slots];
    return slots.sort((a, b) => a.order - b.order);
  }, [raid.slots]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Require only 3px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Disable sensors when reordering to prevent multiple simultaneous operations
  const disabledSensors = isReordering ? [] : sensors;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      await reorderSlots(String(active.id), String(over.id));
    }
  };

  if (slots.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No slots created yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <DndContext sensors={disabledSensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {viewMode === "list" ? (
            <SortableContext items={slots.map((slot) => slot.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-1">
                {slots.map((slot: RaidSlot) => (
                  <ListRaidSlotCard key={slot.id} slot={slot} />
                ))}
              </div>
            </SortableContext>
          ) : (
            <SortableContext items={slots.map((slot) => slot.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {slots.map((slot: RaidSlot) => (
                  <GridRaidSlotCard key={slot.id} slot={slot} />
                ))}
              </div>
            </SortableContext>
          )}
        </DndContext>

        {/* Loading overlay during reordering */}
        {isReordering && (
          <div className="bg-background/50 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-card rounded-lg border px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                <span className="text-sm font-medium">Reordering slots...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Slot Sheet */}
      <RaidSlotSheet isOpen={!!editingSlot} onClose={cancelEditing} mode="edit" slot={editingSlot} onSave={saveSlot} />
    </>
  );
}
