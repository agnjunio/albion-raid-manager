import type { Raid, RaidSlot, RaidRole } from "@albion-raid-manager/types";

import { useState } from "react";

import { faPlus, faTrash, faEdit, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface RaidCompositionManagerProps {
  raid: Raid;
  onSlotUpdate?: (slotId: string, updates: Partial<RaidSlot>) => void;
  onSlotDelete?: (slotId: string) => void;
  onSlotCreate?: (slot: Omit<RaidSlot, "id" | "createdAt" | "joinedAt">) => void;
}

const ROLE_OPTIONS: { value: RaidRole; label: string }[] = [
  { value: "CALLER", label: "Caller" },
  { value: "TANK", label: "Tank" },
  { value: "HEALER", label: "Healer" },
  { value: "SUPPORT", label: "Support" },
  { value: "RANGED_DPS", label: "Ranged DPS" },
  { value: "MELEE_DPS", label: "Melee DPS" },
  { value: "BATTLEMOUNT", label: "Battlemount" },
];

const roleColors: Record<RaidRole, string> = {
  TANK: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  CALLER:
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  SUPPORT:
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
  HEALER: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
  RANGED_DPS: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  MELEE_DPS:
    "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800",
  BATTLEMOUNT:
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
};

interface EditingSlot {
  id: string;
  name: string;
  role?: RaidRole;
  comment?: string;
}

export function RaidCompositionManager({
  raid,
  onSlotUpdate,
  onSlotDelete,
  onSlotCreate,
}: RaidCompositionManagerProps) {
  const [editingSlot, setEditingSlot] = useState<EditingSlot | null>(null);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ name: "", role: undefined as RaidRole | undefined, comment: "" });

  const canEditComposition = raid.status === "SCHEDULED" || raid.status === "OPEN" || raid.status === "CLOSED";
  const isFlexRaid = raid.type === "FLEX";
  const currentSlotCount = raid.slots?.length || 0;
  const maxSlots = raid.maxPlayers || 0;
  const canAddSlots = isFlexRaid && (maxSlots === 0 || currentSlotCount < maxSlots);

  const handleEditSlot = (slot: RaidSlot) => {
    setEditingSlot({
      id: slot.id,
      name: slot.name,
      role: slot.role || undefined,
      comment: slot.comment || "",
    });
  };

  const handleSaveSlot = () => {
    if (!editingSlot) return;

    if (!editingSlot.name.trim()) {
      toast.error("Slot name is required");
      return;
    }

    onSlotUpdate?.(editingSlot.id, {
      name: editingSlot.name.trim(),
      role: editingSlot.role,
      comment: editingSlot.comment?.trim() || undefined,
    });

    setEditingSlot(null);
    toast.success("Slot updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
  };

  const handleDeleteSlot = (slotId: string) => {
    if (window.confirm("Are you sure you want to delete this slot?")) {
      onSlotDelete?.(slotId);
      toast.success("Slot deleted successfully");
    }
  };

  const handleAddSlot = () => {
    if (!newSlot.name.trim()) {
      toast.error("Slot name is required");
      return;
    }

    onSlotCreate?.({
      name: newSlot.name.trim(),
      role: newSlot.role || null,
      comment: newSlot.comment?.trim() || null,
      raidId: raid.id,
      userId: null,
    });

    setNewSlot({ name: "", role: undefined, comment: "" });
    setIsAddingSlot(false);
    toast.success("Slot added successfully");
  };

  const handleCancelAdd = () => {
    setNewSlot({ name: "", role: undefined, comment: "" });
    setIsAddingSlot(false);
  };

  const groupedSlots = (raid.slots || []).reduce(
    (acc, slot) => {
      const role = slot.role || "UNASSIGNED";
      if (!acc[role]) acc[role] = [];
      acc[role].push(slot);
      return acc;
    },
    {} as Record<string, RaidSlot[]>,
  );

  const roleOrder = ["CALLER", "TANK", "HEALER", "SUPPORT", "RANGED_DPS", "MELEE_DPS", "BATTLEMOUNT", "UNASSIGNED"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faEdit} className="h-5 w-5" />
            Raid Composition
            <Badge variant="outline" className="ml-2">
              {currentSlotCount} / {maxSlots === 0 ? "∞" : maxSlots} slots
            </Badge>
          </CardTitle>
          {canEditComposition && canAddSlots && (
            <Button
              onClick={() => setIsAddingSlot(true)}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
              Add Slot
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!canEditComposition && (
          <div className="mb-4 rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <p className="text-sm">
              Raid composition can only be edited when the raid is in SCHEDULED, OPEN, or CLOSED status.
            </p>
          </div>
        )}

        {isAddingSlot && (
          <Card className="border-primary/50 mb-4 border-2 border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add New Slot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Slot Name</label>
                  <Input
                    placeholder="Enter slot name..."
                    value={newSlot.name}
                    onChange={(e) => setNewSlot({ ...newSlot, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role (Optional)</label>
                  <Select
                    value={newSlot.role || ""}
                    onValueChange={(value) => setNewSlot({ ...newSlot, role: value as RaidRole })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Comment (Optional)</label>
                <Textarea
                  placeholder="Enter slot requirements or notes..."
                  value={newSlot.comment}
                  onChange={(e) => setNewSlot({ ...newSlot, comment: e.target.value })}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSlot} size="sm">
                  <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                  Add Slot
                </Button>
                <Button onClick={handleCancelAdd} variant="outline" size="sm">
                  <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {roleOrder.map((role) => {
            const roleSlots = groupedSlots[role];
            if (!roleSlots || roleSlots.length === 0) return null;

            return (
              <div key={role} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold capitalize">
                    {role === "UNASSIGNED" ? "Unassigned" : role.replace("_", " ").toLowerCase()}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {roleSlots.length} slot{roleSlots.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="grid gap-2">
                  {roleSlots.map((slot) => (
                    <div key={slot.id}>
                      {editingSlot?.id === slot.id ? (
                        <Card className="border-primary/50 border-2">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                  <label className="text-sm font-medium">Slot Name</label>
                                  <Input
                                    value={editingSlot.name}
                                    onChange={(e) => setEditingSlot({ ...editingSlot, name: e.target.value })}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Role</label>
                                  <Select
                                    value={editingSlot.role || ""}
                                    onValueChange={(value) =>
                                      setEditingSlot({ ...editingSlot, role: value as RaidRole })
                                    }
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue placeholder="Select role..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {ROLE_OPTIONS.map((option) => (
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
                                  value={editingSlot.comment}
                                  onChange={(e) => setEditingSlot({ ...editingSlot, comment: e.target.value })}
                                  className="mt-1"
                                  rows={2}
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={handleSaveSlot} size="sm">
                                  <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                                  Save
                                </Button>
                                <Button onClick={handleCancelEdit} variant="outline" size="sm">
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
                              <div className="flex items-center gap-3">
                                <div className="text-2xl">{slot.role ? "🎯" : "❓"}</div>
                                <div className="flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <h4 className="text-sm font-semibold">{slot.name}</h4>
                                    {slot.role && (
                                      <Badge variant="outline" className={`text-xs ${roleColors[slot.role]}`}>
                                        {slot.role.replace("_", " ")}
                                      </Badge>
                                    )}
                                  </div>
                                  {slot.comment && <p className="text-muted-foreground text-xs">{slot.comment}</p>}
                                </div>
                              </div>
                              {canEditComposition && (
                                <div className="flex gap-1">
                                  <Button onClick={() => handleEditSlot(slot)} variant="outline" size="sm">
                                    <FontAwesomeIcon icon={faEdit} className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <FontAwesomeIcon icon={faTrash} className="h-4 w-4" />
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

          {(!raid.slots || raid.slots.length === 0) && (
            <div className="py-12 text-center">
              <FontAwesomeIcon icon={faEdit} className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No Raid Slots</h3>
              <p className="text-muted-foreground">
                {isFlexRaid
                  ? "This flexible raid doesn't have any slots defined yet. Add slots to organize your raid composition."
                  : "This fixed raid doesn't have any slots defined yet."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
