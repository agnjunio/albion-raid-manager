import { RaidSlot } from "@albion-raid-manager/types";
import { faEdit, faGripVertical, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useRaidContext } from "../contexts/raid-context";
import { useRaidSlotContext } from "../contexts/raid-slot-context";

interface RaidCompositionActionsProps {
  slot: RaidSlot;
  viewMode: "list" | "grid";
  className?: string;
}

export function RaidCompositionActions({ slot, viewMode, className }: RaidCompositionActionsProps) {
  const { canEditComposition, canChangeRaidSlotCount } = useRaidContext();
  const { startEditingSlot, deleteSlot } = useRaidSlotContext();

  if (!canEditComposition) return null;

  const buttonSize = viewMode === "list" ? "icon" : "sm";
  const iconSize = viewMode === "list" ? "size-4" : "size-3";

  return (
    <div className={cn("flex gap-2", className)}>
      <Button onClick={() => startEditingSlot(slot)} variant="outline" size={buttonSize}>
        <FontAwesomeIcon icon={faEdit} className={iconSize} />
      </Button>
      {canChangeRaidSlotCount && (
        <Button
          onClick={() => deleteSlot(slot.id)}
          variant="outline"
          size={buttonSize}
          className="text-red-600 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTrash} className={iconSize} />
        </Button>
      )}
      <Button onClick={() => {}} variant="ghost" size={buttonSize}>
        <FontAwesomeIcon icon={faGripVertical} className={iconSize} />
      </Button>
    </div>
  );
}
