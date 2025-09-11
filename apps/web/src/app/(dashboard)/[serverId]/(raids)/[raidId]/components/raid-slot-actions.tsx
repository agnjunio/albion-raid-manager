import { RaidSlot } from "@albion-raid-manager/types";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useRaidSlotContext } from "../contexts/raid-slot-context";

interface RaidSlotActionsProps {
  slot: RaidSlot;
  size: "md" | "sm";
}

export function RaidSlotActions({ slot, size }: RaidSlotActionsProps) {
  const { startEditingSlot, deleteSlot, canDeleteRaidSlot, canEditRaidSlot } = useRaidSlotContext();

  if (!canEditRaidSlot) return null;

  const buttonSize = size === "md" ? "icon" : "sm";
  const iconSize = size === "md" ? "size-4" : "size-3";

  return (
    <div className={cn("flex gap-2")}>
      <Button onClick={() => startEditingSlot(slot)} variant="outline" size={buttonSize}>
        <FontAwesomeIcon icon={faEdit} className={iconSize} />
      </Button>
      {canDeleteRaidSlot && (
        <Button onClick={() => deleteSlot(slot.id)} variant="destructiveOutline" size={buttonSize}>
          <FontAwesomeIcon icon={faTrash} className={iconSize} />
        </Button>
      )}
    </div>
  );
}
