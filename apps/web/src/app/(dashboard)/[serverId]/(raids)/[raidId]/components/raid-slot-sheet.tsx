import type { RaidRole } from "@albion-raid-manager/types";

import { useEffect } from "react";

import { raidSlotSchema } from "@albion-raid-manager/types/schemas";
import { Item } from "@albion-raid-manager/types/services";
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
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { ItemPicker } from "@/components/albion/item-picker";
import { MemberSelection } from "@/components/servers/member-selection";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

const stringToItem = (weaponString: string | null): Pick<Item, "item_id"> | null => {
  if (!weaponString || weaponString.trim() === "") return null;

  // For now, return a basic item object with the ID
  // The ItemPicker will fetch the proper display name when it renders
  return {
    item_id: weaponString.trim(),
  };
};

const itemToString = (item: Item | null): string | null => {
  return item?.item_id || null;
};

import { useRaidContext } from "../contexts/raid-context";
import { useRoleOptions, type EditingSlot } from "../helpers/raid-composition-utils";

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
  const { t } = useTranslation();
  const { serverMembers } = useRaidContext();
  const roleOptions = useRoleOptions();

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

  const title = mode === "add" ? t("raids.composition.addSlotTitle") : t("raids.composition.editSlotTitle");
  const description =
    mode === "add" ? t("raids.composition.addSlotDescription") : t("raids.composition.editSlotDescription");

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
          <div className="relative flex flex-1 flex-col overflow-y-auto">
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
                              {t("raids.composition.slotName")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("raids.composition.slotNamePlaceholder")}
                                className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              {t("raids.composition.slotNameDescription")}
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
                              {t("raids.composition.role")}
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="text-foreground focus:border-primary/50 h-12 w-full border-2 text-base transition-colors">
                                  <SelectValue placeholder={t("raids.composition.rolePlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {roleOptions.map((option: { value: RaidRole; label: string }) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              {t("raids.composition.roleDescription")}
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
                              {t("raids.composition.member")}
                            </FormLabel>
                            <FormControl>
                              <MemberSelection
                                members={serverMembers}
                                selectedUserId={field.value}
                                onSelect={field.onChange}
                                placeholder={t("raids.composition.memberPlaceholder")}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              {t("raids.composition.memberDescription")}
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
                              {t("raids.composition.weapon")}
                            </FormLabel>
                            <FormControl>
                              <ItemPicker
                                value={stringToItem(field.value)}
                                onValueChange={(item: Item | null) => field.onChange(itemToString(item))}
                                slotType="mainhand"
                                placeholder={t("raids.composition.weaponPlaceholder")}
                                searchPlaceholder={t("raids.composition.weaponSearchPlaceholder")}
                                emptyMessage={t("raids.composition.weaponEmptyMessage")}
                                maxResults={20}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              {t("raids.composition.weaponDescription")}
                            </FormDescription>
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
                              {t("raids.composition.comment")}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("raids.composition.commentPlaceholder")}
                                className="focus:border-primary/50 min-h-[120px] resize-none border-2 text-base leading-relaxed transition-colors"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              {t("raids.composition.commentDescription")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="border-border bg-muted/95 supports-[backdrop-filter]:bg-muted/60 sticky bottom-0 border-t px-6 py-4 backdrop-blur">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        className="hover:bg-muted flex-1 transition-all duration-200"
                        onClick={handleCancel}
                      >
                        <FontAwesomeIcon icon={faTimes} className="mr-2 h-4 w-4" />
                        {t("raids.composition.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 transition-all duration-200"
                      >
                        <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                        {mode === "add" ? t("raids.composition.addSlotButton") : t("raids.composition.saveChanges")}
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
