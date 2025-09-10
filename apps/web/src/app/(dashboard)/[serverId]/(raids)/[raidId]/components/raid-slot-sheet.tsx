import type { RaidRole } from "@albion-raid-manager/types";

import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

import { MemberSelection } from "@/components/servers/member-selection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

import { useRaidContext } from "../contexts/raid-context";
import { ROLE_OPTIONS, type EditingSlot } from "../helpers/raid-composition-utils";

interface RaidSlotSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  slot?: EditingSlot | null;
  onSave: (slotData: { name: string; role?: RaidRole | null; comment?: string | null; userId?: string | null }) => void;
}

export function RaidSlotSheet({ isOpen, onClose, mode, slot, onSave }: RaidSlotSheetProps) {
  const { serverMembers } = useRaidContext();
  const [formData, setFormData] = useState({
    name: slot?.name || "",
    role: slot?.role || ("" as RaidRole | ""),
    comment: slot?.comment || "",
    userId: slot?.userId || null,
  });

  // Reset form when slot changes or mode changes
  useState(() => {
    setFormData({
      name: slot?.name || "",
      role: slot?.role || ("" as RaidRole | ""),
      comment: slot?.comment || "",
      userId: slot?.userId || null,
    });
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      return;
    }

    onSave({
      name: formData.name.trim(),
      role: formData.role || null,
      comment: formData.comment?.trim() || null,
      userId: formData.userId,
    });

    // Reset form
    setFormData({
      name: "",
      role: "" as RaidRole | "",
      comment: "",
      userId: null,
    });

    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: "",
      role: "" as RaidRole | "",
      comment: "",
      userId: null,
    });

    onClose();
  };

  const title = mode === "add" ? "Add New Slot" : "Edit Slot";
  const description = mode === "add" ? "Create a new slot for your raid composition" : "Modify the slot details";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" size="lg" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <span className="text-xl">{mode === "add" ? "➕" : "✏️"}</span>
            </div>
            {title}
          </SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 py-6">
          <div className="space-y-6">
            <div>
              <label className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <span className="text-sm">📝</span>
                </div>
                Slot Name
              </label>
              <Input
                placeholder="Enter slot name..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-colors"
              />
              <p className="text-muted-foreground mt-2 text-sm">
                A descriptive name for this slot (e.g., "Main Tank", "Healer 1")
              </p>
            </div>

            <div>
              <label className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <span className="text-sm">⚔️</span>
                </div>
                Role (Optional)
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as RaidRole })}
              >
                <SelectTrigger className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-colors">
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
              <p className="text-muted-foreground mt-2 text-sm">Choose the primary role for this slot</p>
            </div>

            <div>
              <label className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <span className="text-sm">👤</span>
                </div>
                Member (Optional)
              </label>
              <MemberSelection
                members={serverMembers}
                selectedUserId={formData.userId}
                onSelect={(userId) => setFormData({ ...formData, userId })}
                placeholder="Select a member..."
              />
              <p className="text-muted-foreground mt-2 text-sm">Assign a specific member to this slot</p>
            </div>

            <div>
              <label className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                  <span className="text-sm">💬</span>
                </div>
                Comment (Optional)
              </label>
              <Textarea
                placeholder="Enter slot requirements or notes..."
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="focus:border-primary/50 h-20 border-2 text-base font-medium transition-colors"
                rows={3}
              />
              <p className="text-muted-foreground mt-2 text-sm">Add any special requirements or notes for this slot</p>
            </div>
          </div>
        </div>

        <SheetFooter className="border-border bg-muted/30 -mx-6 -mb-6 mt-8 border-t px-6 py-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="hover:bg-muted flex-1 transition-all duration-200"
              onClick={handleCancel}
            >
              <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              type="button"
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 transition-all duration-200"
              onClick={handleSave}
              disabled={!formData.name.trim()}
            >
              <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
              {mode === "add" ? "Add Slot" : "Save Changes"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
