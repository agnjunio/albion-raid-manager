import type { RaidSlot } from "@albion-raid-manager/types";

import { faComment } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useRaidContext } from "../contexts/raid-context";
import { useRaidSlotContext } from "../contexts/raid-slot-context";
import { getRoleColor, getRoleIcon } from "../helpers/raid-composition-utils";

import { RaidCompositionActions } from "./raid-composition-actions";
import { RaidSlotSheet } from "./raid-slot-sheet";
import { ServerMemberInfo } from "./server-member-info";

export function RaidCompositionGridView() {
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
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {slots.map((slot: RaidSlot) => (
          <Card
            key={slot.id}
            className="hover:bg-muted/50 group gap-2 py-5 transition-all duration-200 hover:shadow-md"
          >
            <CardHeader>
              <div className="flex w-full items-center justify-between">
                {slot.role ? (
                  <Badge variant="outline" className={`text-xs ${getRoleColor(slot.role)}`}>
                    {slot.role.replace("_", " ")}
                  </Badge>
                ) : (
                  <Badge variant="outline" className={`text-xs ${getRoleColor("UNASSIGNED")}`}>
                    UNASSIGNED
                  </Badge>
                )}
                <RaidCompositionActions slot={slot} viewMode="grid" />
              </div>
            </CardHeader>
            <CardContent className="flex w-full flex-col gap-3 px-6">
              {/* Slot Header */}
              <div className="flex w-full items-start justify-start gap-2">
                <div className="flex min-w-0 flex-1 items-start justify-start gap-3">
                  <div className="bg-muted flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                    <span className="text-xl">{slot.role ? getRoleIcon(slot.role) : "❓"}</span>
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
        ))}
      </div>

      {/* Edit Slot Sheet */}
      <RaidSlotSheet isOpen={!!editingSlot} onClose={cancelEditing} mode="edit" slot={editingSlot} onSave={saveSlot} />
    </>
  );
}
