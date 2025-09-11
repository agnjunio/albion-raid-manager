import { RaidSlot } from "@albion-raid-manager/types";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useRaidSlotContext } from "../contexts/raid-slot-context";

interface RaidCompositionActionsProps {
  slot: RaidSlot;
  viewMode: "list" | "grid";
  className?: string;
}

export function RaidCompositionActions({ slot, viewMode, className }: RaidCompositionActionsProps) {
  const { startEditingSlot, deleteSlot, canDeleteRaidSlot, canEditRaidSlot } = useRaidSlotContext();

  if (!canEditRaidSlot) return null;

  const buttonSize = viewMode === "list" ? "icon" : "sm";
  const iconSize = viewMode === "list" ? "size-4" : "size-3";

  return (
    <div className={cn("flex gap-2", className)}>
      <Button onClick={() => startEditingSlot(slot)} variant="outline" size={buttonSize}>
        <FontAwesomeIcon icon={faEdit} className={iconSize} />
      </Button>
      {canDeleteRaidSlot && (
        <Button
          onClick={() => deleteSlot(slot.id)}
          variant="outline"
          size={buttonSize}
          className="text-red-600 hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTrash} className={iconSize} />
        </Button>
      )}
    </div>
  );
}
