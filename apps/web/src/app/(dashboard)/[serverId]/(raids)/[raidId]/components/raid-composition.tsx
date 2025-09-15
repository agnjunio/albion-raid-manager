import { faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useRaidContext } from "../contexts/raid-context";
import { useRaidSlotContext } from "../contexts/raid-slot-context";
import { useViewMode } from "../contexts/view-mode-context";

import { RaidCompositionList } from "./raid-composition-list";
import { RaidCompositionViewToggle } from "./raid-composition-view-toggle";
import { RaidSlotSheet } from "./raid-slot-sheet";

export function RaidComposition() {
  const { t } = useTranslation();
  const { maxSlots, hasStatus } = useRaidContext();
  const { viewMode } = useViewMode();
  const { isAddingSlot, currentSlotCount, startAddingSlot, saveSlot, cancelAdding, canEditRaidSlot, canAddRaidSlot } =
    useRaidSlotContext();

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
                <h2 className="text-xl font-bold">{t("raids.composition.title")}</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                {currentSlotCount} / {maxSlots === 0 ? "∞" : maxSlots} {t("raids.composition.slots")}
              </p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-3">
            <RaidCompositionViewToggle />
            {canEditRaidSlot && canAddRaidSlot && currentSlotCount > 0 && (
              <Button
                onClick={startAddingSlot}
                size="md"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                {t("raids.composition.addSlot")}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!canEditRaidSlot && !hasStatus("SCHEDULED", "OPEN", "CLOSED") && (
          <Alert variant="warning">
            <p className="text-sm">{t("raids.composition.editWarning")}</p>
          </Alert>
        )}

        <RaidCompositionList viewMode={viewMode} />
      </CardContent>

      {/* Add Slot Sheet */}
      <RaidSlotSheet isOpen={isAddingSlot} onClose={cancelAdding} mode="add" onSave={saveSlot} />
    </Card>
  );
}
