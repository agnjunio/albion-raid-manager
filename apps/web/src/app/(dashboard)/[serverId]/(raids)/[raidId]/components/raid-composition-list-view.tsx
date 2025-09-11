import type { RaidSlot } from "@albion-raid-manager/types";

import { faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useRaidContext } from "../contexts/raid-context";
import { useRaidSlotContext } from "../contexts/raid-slot-context";
import { getRoleColor, getRoleIcon } from "../helpers/raid-composition-utils";

import { RaidCompositionActions } from "./raid-composition-actions";
import { RaidSlotSheet } from "./raid-slot-sheet";
import { ServerMemberInfo } from "./server-member-info";

export function RaidCompositionListView() {
  const { raid } = useRaidContext();
  const { editingSlot, saveSlot, cancelEditing } = useRaidSlotContext();
  const slots = raid.slots || [];

  if (slots.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No slots created yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {slots.map((slot: RaidSlot) => (
          <Card key={slot.id} className="hover:bg-muted/50 py-4 transition-all duration-200 hover:shadow-sm">
            <CardContent className="px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Role Icon */}
                  <div className="bg-muted flex size-12 items-center justify-center rounded-lg">
                    <span className="text-xl">{slot.role ? getRoleIcon(slot.role) : "❓"}</span>
                  </div>

                  {/* Slot Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="truncate text-base font-medium">{slot.name}</h4>
                      {slot.role && (
                        <Badge variant="outline" className={`px-1.5 py-0.5 text-xs ${getRoleColor(slot.role)}`}>
                          {slot.role.replace("_", " ")}
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
                <RaidCompositionActions slot={slot} viewMode="list" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Slot Sheet */}
      <RaidSlotSheet isOpen={!!editingSlot} onClose={cancelEditing} mode="edit" slot={editingSlot} onSave={saveSlot} />
    </>
  );
}
