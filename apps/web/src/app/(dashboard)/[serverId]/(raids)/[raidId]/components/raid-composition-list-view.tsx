import type { RaidRole, RaidSlot } from "@albion-raid-manager/types";

import { faEdit, faSave, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useRaidContext } from "../contexts/raid-context";
import {
  getRoleColor,
  getRoleIcon,
  groupSlotsByRole,
  ROLE_OPTIONS,
  roleOrder,
  type EditingSlot,
} from "../helpers/raid-composition-utils";

interface RaidCompositionListViewProps {
  editingSlot: EditingSlot | null;
  onEditSlot: (slot: { id: string; name: string; role?: RaidRole | null; comment?: string | null }) => void;
  onSaveSlot: () => void;
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
  const { raid, canEditComposition } = useRaidContext();
  const groupedSlots = groupSlotsByRole(raid.slots || []);

  return (
    <div className="space-y-4">
      {roleOrder.map((role: string) => {
        const roleSlots = groupedSlots[role];
        if (!roleSlots || roleSlots.length === 0) return null;

        return (
          <div key={role} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getRoleIcon(role as RaidRole | "UNASSIGNED")}</span>
                <h3 className="text-lg font-semibold capitalize">
                  {role === "UNASSIGNED" ? "Unassigned" : role.replace("_", " ").toLowerCase()}
                </h3>
              </div>
              <Badge variant="secondary" className="text-xs">
                {roleSlots.length} slot{roleSlots.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            <div className="space-y-2">
              {roleSlots.map((slot: RaidSlot) => (
                <div key={slot.id}>
                  {editingSlot?.id === slot.id ? (
                    <Card className="border-primary/50 border-2">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <div>
                              <label className="text-sm font-medium">Slot Name</label>
                              <Input
                                value={editingSlot?.name || ""}
                                onChange={(e) =>
                                  editingSlot && setEditingSlot({ ...editingSlot, name: e.target.value })
                                }
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Role</label>
                              <Select
                                value={editingSlot?.role || ""}
                                onValueChange={(value) =>
                                  editingSlot && setEditingSlot({ ...editingSlot, role: value as RaidRole })
                                }
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue placeholder="Select role..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map((option: { value: RaidRole; label: string }) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium">Comment</label>
                            <Textarea
                              value={editingSlot?.comment || ""}
                              onChange={(e) =>
                                editingSlot && setEditingSlot({ ...editingSlot, comment: e.target.value })
                              }
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={onSaveSlot} size="sm">
                              <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                              Save
                            </Button>
                            <Button onClick={onCancelEdit} variant="outline" size="sm">
                              <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="transition-all duration-200 hover:shadow-md">
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
                              <Button
                                onClick={() => onDeleteSlot(slot.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <FontAwesomeIcon icon={faTrash} className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
