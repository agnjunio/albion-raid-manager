import type { RaidSlot } from "@albion-raid-manager/types";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { faComment, faGripVertical } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import { AlbionItemIcon } from "@/components/albion/item-icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useRaidSlotContext } from "../contexts/raid-slot-context";
import { getRoleColor, getRoleIcon } from "../helpers/raid-composition-utils";

import { RaidSlotActions } from "./raid-slot-actions";
import { ServerMemberInfo } from "./server-member-info";

export function ListRaidSlotCard({ slot }: { slot: RaidSlot }) {
  const { t } = useTranslation();
  const { canEditRaidSlot } = useRaidSlotContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition, // Disable transition during drag for faster movement
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`hover:bg-muted/50 py-4 transition-all duration-100 hover:shadow-sm ${
        isDragging ? "scale-105 opacity-50 shadow-lg" : ""
      } ${isOver ? "ring-primary/50 ring-2" : ""}`}
    >
      <CardContent className="px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            {canEditRaidSlot && (
              <div
                {...attributes}
                {...listeners}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-grab rounded p-1 transition-colors duration-75 active:cursor-grabbing"
              >
                <FontAwesomeIcon icon={faGripVertical} className="h-4 w-4" />
              </div>
            )}

            {/* Role/Weapon Icon */}
            <div className="flex size-16 items-center justify-center">
              {slot.weapon ? (
                <AlbionItemIcon item={slot.weapon} size="lg" />
              ) : (
                <div className="bg-muted flex size-16 items-center justify-center rounded-lg">
                  <span className="text-2xl">{slot.role ? getRoleIcon(slot.role) : "❓"}</span>
                </div>
              )}
            </div>

            {/* Slot Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-base font-medium">{slot.name}</h4>
                {slot.role && (
                  <Badge variant="outline" className={`px-1.5 py-0.5 text-xs ${getRoleColor(slot.role)}`}>
                    {t(`raidSlot.roles.${slot.role}`)}
                  </Badge>
                )}

                {slot.comment && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <FontAwesomeIcon icon={faComment} className="mt-0.5 size-3" />
                    </TooltipTrigger>
                    <TooltipContent variant="info">
                      <pre className="text-muted-foreground flex flex-1 items-center gap-2 text-wrap text-xs leading-relaxed">
                        {slot.comment}
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>

              <div className="mt-0.5 flex items-center gap-3">
                <ServerMemberInfo userId={slot.userId} size="md" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <RaidSlotActions slot={slot} size="md" />
        </div>
      </CardContent>
    </Card>
  );
}

export function GridRaidSlotCard({ slot }: { slot: RaidSlot }) {
  const { t } = useTranslation();
  const { canEditRaidSlot } = useRaidSlotContext();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition, // Disable transition during drag for faster movement
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`hover:bg-muted/50 group gap-2 py-5 transition-colors duration-100 hover:shadow-md ${
        isDragging ? "scale-105 opacity-50 shadow-lg" : ""
      } ${isOver ? "ring-primary/50 ring-2" : ""}`}
    >
      <CardContent className="flex w-full flex-col gap-3 pl-6 pr-4">
        {/* Header with drag handle and actions */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Drag Handle */}
            {canEditRaidSlot && (
              <div
                {...attributes}
                {...listeners}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-grab rounded p-1 transition-colors duration-75 active:cursor-grabbing"
              >
                <FontAwesomeIcon icon={faGripVertical} className="h-3 w-3" />
              </div>
            )}

            {slot.role ? (
              <Badge variant="outline" className={`text-xs ${getRoleColor(slot.role)}`}>
                {t(`raidSlot.roles.${slot.role}`)}
              </Badge>
            ) : (
              <Badge variant="outline" className={`text-xs ${getRoleColor("UNASSIGNED")}`}>
                {t("raidSlot.unassigned")}
              </Badge>
            )}
          </div>
          <RaidSlotActions slot={slot} size="sm" />
        </div>

        {/* Slot Header */}
        <div className="flex w-full items-start justify-start gap-2">
          <div className="flex min-w-0 flex-1 items-center justify-start gap-2.5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
              {slot.weapon ? (
                <AlbionItemIcon item={slot.weapon} size="md" />
              ) : (
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <span className="text-xl">{slot.role ? getRoleIcon(slot.role) : "❓"}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <ServerMemberInfo userId={slot.userId} size="sm" />
              <h4 className="text-wrap text-sm font-semibold">{slot.name}</h4>
            </div>
          </div>
        </div>

        {/* Slot Details */}
        {slot.comment && (
          <div className="flex items-start gap-2">
            <FontAwesomeIcon icon={faComment} className="mt-0.5 size-3" />
            <pre className="text-muted-foreground flex flex-1 items-center gap-2 text-wrap text-xs leading-relaxed">
              {slot.comment}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
