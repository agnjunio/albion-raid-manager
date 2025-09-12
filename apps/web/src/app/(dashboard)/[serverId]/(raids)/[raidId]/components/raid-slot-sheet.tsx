import type { RaidRole } from "@albion-raid-manager/types";

import { useEffect } from "react";

import { raidSlotSchema } from "@albion-raid-manager/types/schemas";
import {
  faComment,
  faFilePen,
  faHammer,
  faPenToSquare,
  faPlus,
  faSave,
  faShieldAlt,
  faTimes,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AlbionItemIcon } from "@/components/albion/item-icon";
import { MemberSelection } from "@/components/servers/member-selection";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { WEAPON_EXAMPLES } from "@/lib/albion/item-validation";

import { useRaidContext } from "../contexts/raid-context";
import { ROLE_OPTIONS, type EditingSlot } from "../helpers/raid-composition-utils";

type RaidSlotFormData = z.infer<typeof raidSlotSchema>;

interface RaidSlotSheetProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  slot?: EditingSlot | null;
  onSave: (slotData: {
    name: string;
    role?: RaidRole | null;
    comment?: string | null;
    userId?: string | null;
    weapon?: string | null;
  }) => void;
}

export function RaidSlotSheet({ isOpen, onClose, mode, slot, onSave }: RaidSlotSheetProps) {
  const { serverMembers } = useRaidContext();

  const form = useForm<RaidSlotFormData>({
    resolver: zodResolver(raidSlotSchema),
    defaultValues: {
      name: "",
      role: undefined,
      comment: "",
      userId: null,
      weapon: "",
    },
  });

  useEffect(() => {
    if (slot) {
      form.reset({
        name: slot.name || "",
        role: slot.role || undefined,
        comment: slot.comment || "",
        userId: slot.userId || null,
        weapon: slot.weapon || "",
      });
    } else {
      form.reset({
        name: "",
        role: undefined,
        comment: "",
        userId: null,
        weapon: "",
      });
    }
  }, [slot, form]);

  const handleSubmit = (data: z.infer<typeof raidSlotSchema>) => {
    onSave({
      name: data.name.trim(),
      role: data.role || null,
      comment: data.comment?.trim() || null,
      userId: data.userId || null,
      weapon: data.weapon || null,
    });

    form.reset();
    onClose();
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  const title = mode === "add" ? "Add New Slot" : "Edit Slot";
  const description = mode === "add" ? "Create a new slot for your raid composition" : "Modify the slot details";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" size="xl">
        <div className="flex h-full flex-col">
          {/* Header Section */}
          <SheetHeader className="border-border border-b px-6 pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <FontAwesomeIcon icon={mode === "add" ? faPlus : faPenToSquare} className="text-primary h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-foreground text-2xl font-bold">{title}</SheetTitle>
                <SheetDescription className="text-muted-foreground text-base">{description}</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Section */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="flex grow">
                <div className="flex w-full flex-col justify-between gap-6">
                  <div className="space-y-6 p-6">
                    {/* Slot Name */}
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faFilePen} className="text-primary h-4 w-4" />
                              </div>
                              Slot Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter slot name..."
                                className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              A descriptive name for this slot (e.g., &quot;Main Tank&quot;, &quot;Healer 1&quot;)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-border border-t"></div>

                    {/* Role and Member */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Role */}
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-muted-foreground h-4 w-4" />
                              </div>
                              Role (Optional)
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-foreground focus:border-primary/50 h-12 w-full border-2 text-base transition-colors">
                                  <SelectValue placeholder="Select role..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {ROLE_OPTIONS.map((option: { value: RaidRole; label: string }) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              Choose the primary role for this slot
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Member */}
                      <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faUser} className="text-muted-foreground h-4 w-4" />
                              </div>
                              Member (Optional)
                            </FormLabel>
                            <FormControl>
                              <MemberSelection
                                members={serverMembers}
                                selectedUserId={field.value}
                                onSelect={field.onChange}
                                placeholder="Select a member..."
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              Assign a specific member to this slot
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-border border-t"></div>

                    {/* Weapon */}
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="weapon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faHammer} className="text-muted-foreground h-4 w-4" />
                              </div>
                              Weapon (Optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="T6_2H_HOLYSTAFF@0"
                                className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-colors"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              Albion item pattern: T[1-8]_[ITEM_NAME]@[0-3]
                              <br />
                              Examples: {WEAPON_EXAMPLES.slice(0, 3).join(", ")}
                            </FormDescription>
                            {field.value && (
                              <div className="mt-3 flex justify-center">
                                <div className="flex h-20 w-20 items-center justify-center">
                                  <AlbionItemIcon item={field.value} size="lg" />
                                </div>
                              </div>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-border border-t"></div>

                    {/* Comment */}
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="comment"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faComment} className="text-muted-foreground h-4 w-4" />
                              </div>
                              Comment (Optional)
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter slot requirements or notes..."
                                className="focus:border-primary/50 min-h-[120px] resize-none border-2 text-base leading-relaxed transition-colors"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              Add any special requirements or notes for this slot
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="border-border bg-muted/30 px-6 py-4">
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
                        type="submit"
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 transition-all duration-200"
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                        {mode === "add" ? "Add Slot" : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
