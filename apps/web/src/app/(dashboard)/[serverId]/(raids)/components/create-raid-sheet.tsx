import type { z } from "zod";

import React, { useState } from "react";

import { APIErrorType, CreateRaid } from "@albion-raid-manager/types/api";
import { CONTENT_TYPE_INFO, getContentTypeInfo } from "@albion-raid-manager/types/entities";
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
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { isAPIError } from "@/lib/api";
import { useCreateRaidMutation } from "@/store/raids";

import { raidFormSchema } from "../schemas";

const DEFAULT_CONTENT_TYPE = CONTENT_TYPE_INFO.filter((contentTypeInfo) => contentTypeInfo.isActive)[0];

interface CreateRaidSheetProps {
  children: React.ReactNode;
  selectedDateTime?: Date;
}

export function CreateRaidSheet({ children, selectedDateTime }: CreateRaidSheetProps) {
  const { serverId } = useParams();
  const [createRaid] = useCreateRaidMutation();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof raidFormSchema>>({
    resolver: zodResolver(raidFormSchema),
    defaultValues: {
      title: "",
      contentType: DEFAULT_CONTENT_TYPE.type,
      description: "",
      location: DEFAULT_CONTENT_TYPE.defaultLocation,
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
      const errorCode = isAPIError(createRaidResponse.error)
        ? createRaidResponse.error.data
        : APIErrorType.INTERNAL_SERVER_ERROR;

      toast.error("Failed to create raid", {
        description: errorCode,
      });
      return;
    }

    setIsOpen(false);
    form.reset();
    toast.success("Raid created successfully", {
      description: "Your raid has been scheduled and is now visible to participants.",
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
                <SheetTitle className="text-foreground text-2xl font-bold">Create New Raid</SheetTitle>
                <SheetDescription className="text-muted-foreground text-base">
                  Schedule and organize your guild&apos;s next adventure
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Form Section */}
          <div className="flex-1 overflow-y-auto px-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 py-6">
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
                          Raid Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a compelling title for your raid..."
                            className="focus:border-primary/50 h-12 border-2 text-base font-medium transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground mt-2 text-sm">
                          Choose a clear, descriptive title that will attract participants
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
                          Content Type
                        </FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            const defaultLocation = getContentTypeInfo(value).defaultLocation;
                            if (defaultLocation) {
                              form.setValue("location", defaultLocation);
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="text-foreground focus:border-primary/50 h-12 w-full border-2 text-base transition-colors">
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTENT_TYPE_INFO.filter((contentTypeInfo) => contentTypeInfo.isActive).map(
                              (contentTypeInfo) => (
                                <SelectItem key={contentTypeInfo.type} value={contentTypeInfo.type}>
                                  {contentTypeInfo.displayName}
                                </SelectItem>
                              ),
                            )}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-muted-foreground mt-2 text-sm">
                          Choose the type of content this raid will focus on
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
                          Start Date & Time
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
                          <FontAwesomeIcon icon={faClock} className="mr-1 h-3 w-3" />
                          Select the start time for your raid
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
                        <FormLabel className="text-muted-foreground mb-3 flex items-center gap-3 text-base font-medium">
                          <div className="bg-muted flex h-6 w-6 items-center justify-center rounded-lg">
                            <FontAwesomeIcon icon={faLocationDot} className="text-muted-foreground h-3 w-3" />
                          </div>
                          Location (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Black Zone, Royal City..."
                            className="focus:border-primary/50 h-10 border-2 text-base transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground mt-2 text-sm">
                          Where will the raid take place? This is optional and can be added later.
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
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide detailed information about the raid objectives, requirements, and what participants can expect..."
                            className="focus:border-primary/50 min-h-[120px] resize-none border-2 text-base leading-relaxed transition-colors"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground mt-2 text-sm">
                          Include objectives, requirements, loot rules, and any special instructions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Form Actions */}
                <div className="border-border bg-muted/30 -mx-6 -mb-6 mt-8 border-t px-6 py-6">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      className="hover:bg-muted flex-1 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1 transition-all duration-200"
                    >
                      <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                      Create Raid
                    </Button>
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

// Hook to provide time slot click functionality to calendar grid
export function useTimeSlotClick() {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>();

  const handleTimeSlotClick = (date: Date, hour: number) => {
    const dateTime = new Date(date);
    dateTime.setHours(hour, 0, 0, 0);
    setSelectedDateTime(dateTime);
  };

  return {
    selectedDateTime,
    handleTimeSlotClick,
    setSelectedDateTime,
  };
}
