import { faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useRaidContext } from "../contexts/raid-context";
import { useRaidSlotContext } from "../contexts/raid-slot-context";
import { useViewMode } from "../contexts/view-mode-context";

import { RaidCompositionGridView } from "./raid-composition-grid-view";
import { RaidCompositionListView } from "./raid-composition-list-view";
import { RaidSlotSheet } from "./raid-slot-sheet";
import { ViewToggle } from "./view-toggle";

export function RaidComposition() {
  const { raid, canEditComposition, isFlexRaid, currentSlotCount, maxSlots, canAddSlots } = useRaidContext();
  const { viewMode, setViewMode } = useViewMode();
  const { isAddingSlot, startAddingSlot, saveSlot, cancelAdding } = useRaidSlotContext();

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
                onClick={startAddingSlot}
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

      <CardContent className="space-y-4">
        {!canEditComposition && (
          <div className="mb-3 rounded-lg bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <p className="text-sm">
              Raid composition can only be edited when the raid is in SCHEDULED, OPEN, or CLOSED status.
            </p>
          </div>
        )}

        {/* Slots List */}
        {viewMode === "grid" ? <RaidCompositionGridView /> : <RaidCompositionListView />}

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
      </CardContent>

      {/* Add Slot Sheet */}
      <RaidSlotSheet isOpen={isAddingSlot} onClose={cancelAdding} mode="add" onSave={saveSlot} />
    </Card>
  );
}
