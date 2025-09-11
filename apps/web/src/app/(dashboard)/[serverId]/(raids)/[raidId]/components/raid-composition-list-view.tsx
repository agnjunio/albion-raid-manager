import type { RaidRole, RaidSlot } from "@albion-raid-manager/types";

import { useMemo } from "react";

import { getUserPictureUrl } from "@albion-raid-manager/core/utils/discord";
import { faEdit, faTrash, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useRaidContext } from "../contexts/raid-context";
import { getRoleColor, getRoleIcon, type EditingSlot } from "../helpers/raid-composition-utils";

import { RaidSlotSheet } from "./raid-slot-sheet";

interface RaidCompositionListViewProps {
  editingSlot: EditingSlot | null;
  onEditSlot: (slot: {
    id: string;
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => void;
  onSaveSlot: (slotData: {
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => void;
  onCancelEdit: () => void;
  onDeleteSlot: (slotId: string) => void;
  setEditingSlot: (slot: EditingSlot | null) => void;
}

export function RaidCompositionListView({
  editingSlot,
  onEditSlot,
  onSaveSlot,
  onCancelEdit,
  onDeleteSlot,
  setEditingSlot,
}: RaidCompositionListViewProps) {
  const { raid, canEditComposition, canChangeRaidSlotCount } = useRaidContext();
  const slots = raid.slots || [];

  const handleSaveSlot = (slotData: {
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
  }) => {
    if (editingSlot) {
      onSaveSlot(slotData);
      setEditingSlot(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    onCancelEdit();
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
      <div className="space-y-2">
        {slots.map((slot: RaidSlot) => (
          <Card key={slot.id} className="transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Role Icon */}
                  <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                    <span className="text-xl">{slot.role ? getRoleIcon(slot.role) : "❓"}</span>
                  </div>

                  {/* Slot Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <h4 className="truncate text-lg font-semibold">{slot.name}</h4>
                      {slot.role && (
                        <Badge variant="outline" className={`text-xs ${getRoleColor(slot.role)}`}>
                          {slot.role.replace("_", " ")}
                        </Badge>
                      )}
                    </div>

                    {slot.userId && <ServerMemberInfo userId={slot.userId} />}
                    {slot.comment && (
                      <p className="text-muted-foreground mb-2 text-sm leading-relaxed">{slot.comment}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {canEditComposition && (
                  <div className="flex gap-2">
                    <Button onClick={() => onEditSlot(slot)} variant="outline" size="sm">
                      <FontAwesomeIcon icon={faEdit} className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    {canChangeRaidSlotCount && (
                      <Button
                        onClick={() => onDeleteSlot(slot.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Slot Sheet */}
      <RaidSlotSheet
        isOpen={!!editingSlot}
        onClose={handleCancelEdit}
        mode="edit"
        slot={editingSlot}
        onSave={handleSaveSlot}
      />
    </>
  );
}

function ServerMemberInfo({ userId }: { userId: string }) {
  const { serverMembers } = useRaidContext();
  const serverMember = useMemo(() => serverMembers.find((m) => m.id === userId), [serverMembers, userId]);

  return (
    <div className="flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={getUserPictureUrl(userId, serverMember?.avatar)} />
        <AvatarFallback className="bg-primary/10">
          <FontAwesomeIcon icon={faUser} className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>
      <span className="text-muted-foreground text-xs">{serverMember?.nickname || "Unknown Member"}</span>
    </div>
  );
}
