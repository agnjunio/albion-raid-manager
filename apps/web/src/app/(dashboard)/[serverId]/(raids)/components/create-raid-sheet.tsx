import type { z } from "zod";

import React, { useState } from "react";

import { APIErrorType, CreateRaid } from "@albion-raid-manager/types/api";
import { getContentTypeInfo } from "@albion-raid-manager/types/entities";
import {
  faCalendar,
  faClock,
  faFileText,
  faGamepad,
  faLocationDot,
  faPlus,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAllContentTypeTranslations } from "@/hooks/use-content-type-translations";
import { isAPIError } from "@/lib/api";
import { translateError } from "@/lib/error-translations";
import { useCreateRaidMutation } from "@/store/raids";

import { raidFormSchema } from "../schemas";

interface CreateRaidSheetProps {
  children: React.ReactNode;
  selectedDateTime?: Date;
}

export function CreateRaidSheet({ children, selectedDateTime }: CreateRaidSheetProps) {
  const { serverId } = useParams();
  const { t } = useTranslation();
  const [createRaid] = useCreateRaidMutation();
  const [isOpen, setIsOpen] = useState(false);
  const translatedContentTypes = useAllContentTypeTranslations(true); // Only active content types

  const form = useForm<z.infer<typeof raidFormSchema>>({
    resolver: zodResolver(raidFormSchema),
    defaultValues: {
      title: "",
      contentType: translatedContentTypes[0]?.type || "",
      description: "",
      location: translatedContentTypes[0]?.defaultLocation || "",
      date:
        selectedDateTime ||
        (() => {
          const now = new Date();
          now.setMinutes(0, 0, 0);
          if (new Date() > now) {
            now.setHours(now.getHours() + 1);
          }
          return now;
        })(),
    },
  });

  React.useEffect(() => {
    if (selectedDateTime) {
      form.setValue("date", selectedDateTime);
      setIsOpen(true);
    }
  }, [selectedDateTime, form]);

  const handleSubmit = async (data: z.infer<typeof raidFormSchema>) => {
    const body: CreateRaid.Body = {
      title: data.title,
      contentType: data.contentType,
      description: data.description,
      date: data.date.toISOString(),
      location: data.location,
    };
    const createRaidResponse = await createRaid({
      params: { serverId: serverId as string },
      body,
    });

    if (createRaidResponse.error) {
      const errorType = isAPIError(createRaidResponse.error)
        ? createRaidResponse.error.data
        : APIErrorType.INTERNAL_SERVER_ERROR;

      toast.error(t("raids.create.error"), {
        description: translateError(errorType),
      });
      return;
    }

    setIsOpen(false);
    form.reset();
    toast.success(t("raids.create.success"), {
      description: t("raids.create.successDescription"),
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" size="xl">
        <div className="flex h-full flex-col">
          {/* Header Section */}
          <SheetHeader className="border-border border-b px-6 pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
                <FontAwesomeIcon icon={faPlus} className="text-primary h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-foreground text-2xl font-bold">{t("raids.create.title")}</SheetTitle>
                <SheetDescription className="text-muted-foreground text-base">
                  {t("raids.create.description")}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Section */}
          <div className="relative flex flex-1 flex-col overflow-y-auto">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="flex grow">
                <div className="flex w-full flex-col justify-between gap-6">
                  <div className="space-y-6 p-6">
                    {/* Raid Title */}
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faShieldAlt} className="text-primary h-4 w-4" />
                              </div>
                              {t("raids.create.raidTitle")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("raids.create.raidTitlePlaceholder")}
                                className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              {t("raids.create.raidTitleDescription")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-border border-t"></div>

                    {/* Content Type and Start Time */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* Content Type */}
                      <FormField
                        control={form.control}
                        name="contentType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faGamepad} className="text-primary h-4 w-4" />
                              </div>
                              {t("raids.create.contentType")}
                            </FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                const defaultLocation = getContentTypeInfo(value).defaultLocation;
                                form.setValue("location", defaultLocation);
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="text-foreground focus:border-primary/50 h-12 w-full border-2 text-base transition-colors">
                                  <SelectValue placeholder={t("raids.create.contentTypePlaceholder")} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {translatedContentTypes.map((contentTypeInfo) => (
                                  <SelectItem key={contentTypeInfo.type} value={contentTypeInfo.type}>
                                    {contentTypeInfo.displayName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              {t("raids.create.contentTypeDescription")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Date and Time */}
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faCalendar} className="text-primary h-4 w-4" />
                              </div>
                              {t("raids.create.startDateTime")}
                            </FormLabel>
                            <FormControl>
                              <DateTimePicker
                                hourCycle={24}
                                granularity="minute"
                                minuteIncrement={30}
                                displayFormat={{ hour24: "dd/MM/yyyy HH:mm" }}
                                className="focus:border-primary/50 h-12 w-full border-2 text-base transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              <FontAwesomeIcon icon={faClock} className="mr-1.5 size-3" />
                              {t("raids.create.startDateTimeDescription")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-border border-t"></div>

                    {/* Location - Optional Field */}
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faLocationDot} className="text-muted-foreground h-4 w-4" />
                              </div>
                              {t("raids.create.location")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder={t("raids.create.locationPlaceholder")}
                                className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              {t("raids.create.locationDescription")}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Divider */}
                    <div className="border-border border-t"></div>

                    {/* Raid Description */}
                    <div className="space-y-6">
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-muted-foreground mb-3 flex items-center gap-3 text-lg font-semibold">
                              <div className="bg-muted flex h-8 w-8 items-center justify-center rounded-lg">
                                <FontAwesomeIcon icon={faFileText} className="text-muted-foreground h-4 w-4" />
                              </div>
                              {t("raids.create.raidDescription")}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t("raids.create.raidDescriptionPlaceholder")}
                                className="focus:border-primary/50 min-h-[120px] resize-none border-2 text-base leading-relaxed transition-colors"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-muted-foreground mt-2 text-sm">
                              {t("raids.create.raidDescriptionDescription")}
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
                        onClick={() => setIsOpen(false)}
                      >
                        {t("raids.create.cancel")}
                      </Button>
                      <Button
                        type="submit"
                        size="lg"
                        className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 transition-all duration-200"
                      >
                        <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                        {t("raids.create.createRaid")}
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
