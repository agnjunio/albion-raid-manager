import type { CreateRaid } from "@albion-raid-manager/core/types/api/raids";
import type { z } from "zod";

import React, { useState } from "react";

import { APIErrorType } from "@albion-raid-manager/core/types/api";
import { faCalendar, faMapMarkerAlt, faUsers, faShieldAlt, faClock, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { isAPIError } from "@/lib/api";
import { useCreateRaidMutation } from "@/store/raids";

import { raidFormSchema } from "../create/schemas";

interface CreateRaidSidebarProps {
  children: React.ReactNode;
  selectedDateTime?: Date;
  onTimeSlotSelect?: (_dateTime: Date) => void;
}

export function CreateRaidSidebar({ children, selectedDateTime }: CreateRaidSidebarProps) {
  const navigate = useNavigate();
  const { serverId } = useParams();
  const [createRaid] = useCreateRaidMutation();
  const [error, setError] = useState<APIErrorType | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<z.infer<typeof raidFormSchema>>({
    resolver: zodResolver(raidFormSchema),
    defaultValues: {
      title: "",
      contentType: "GROUP_DUNGEON",
      description: "",
      location: "",
      maxParticipants: 20,
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

  // Update form when selectedDateTime changes
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
    };
    const createRaidResponse = await createRaid({
      params: { serverId: serverId as string },
      body,
    });

    if (createRaidResponse.error) {
      setError(
        isAPIError(createRaidResponse.error) ? createRaidResponse.error.data : APIErrorType.INTERNAL_SERVER_ERROR,
      );
      return;
    }

    if (createRaidResponse.data) {
      setIsOpen(false);
      navigate(`../${createRaidResponse.data.raid.id}`, { replace: true });
    }
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
            {error && (
              <div className="mt-6">
                <Alert className="border-destructive/50 bg-destructive/10 text-destructive">{error}</Alert>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-10 py-6">
                {/* Raid Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground mb-2 flex items-center gap-2 text-base font-semibold">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-primary h-4 w-4" />
                        Raid Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a compelling title for your raid..."
                          className="h-12 text-base font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground mt-1.5 text-sm">
                        Choose a clear, descriptive title that will attract participants
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Content Type */}
                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground mb-2 flex items-center gap-2 text-base font-semibold">
                        <FontAwesomeIcon icon={faShieldAlt} className="text-primary h-4 w-4" />
                        Content Type
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SOLO_DUNGEON">Solo Dungeon</SelectItem>
                          <SelectItem value="OPEN_WORLD_FARMING">Open World Farming</SelectItem>
                          <SelectItem value="GROUP_DUNGEON">Group Dungeon</SelectItem>
                          <SelectItem value="AVALONIAN_DUNGEON_FULL_CLEAR">Avalonian Dungeon (Full Clear)</SelectItem>
                          <SelectItem value="AVALONIAN_DUNGEON_BUFF_ONLY">Avalonian Dungeon (Buff Only)</SelectItem>
                          <SelectItem value="ROADS_OF_AVALON_PVE">Roads of Avalon (PvE)</SelectItem>
                          <SelectItem value="ROADS_OF_AVALON_PVP">Roads of Avalon (PvP)</SelectItem>
                          <SelectItem value="DEPTHS_DUO">Depths (Duo)</SelectItem>
                          <SelectItem value="DEPTHS_TRIO">Depths (Trio)</SelectItem>
                          <SelectItem value="GANKING_SQUAD">Ganking Squad</SelectItem>
                          <SelectItem value="FIGHTING_SQUAD">Fighting Squad</SelectItem>
                          <SelectItem value="ZVZ_CALL_TO_ARMS">ZvZ Call to Arms</SelectItem>
                          <SelectItem value="HELLGATE_2V2">Hellgate (2v2)</SelectItem>
                          <SelectItem value="HELLGATE_5V5">Hellgate (5v5)</SelectItem>
                          <SelectItem value="HELLGATE_10V10">Hellgate (10v10)</SelectItem>
                          <SelectItem value="MISTS_SOLO">Mists (Solo)</SelectItem>
                          <SelectItem value="MISTS_DUO">Mists (Duo)</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-muted-foreground mt-1.5 text-sm">
                        Choose the type of content this raid will focus on
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Raid Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground mb-2 text-base font-semibold">Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed information about the raid objectives, requirements, and what participants can expect..."
                          className="min-h-[120px] text-base leading-relaxed"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground mt-1.5 text-sm">
                        Include objectives, requirements, loot rules, and any special instructions
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
                      <FormLabel className="text-foreground mb-2 flex items-center gap-2 text-base font-semibold">
                        <FontAwesomeIcon icon={faCalendar} className="text-primary h-4 w-4" />
                        Start Date & Time
                      </FormLabel>
                      <FormControl>
                        <DateTimePicker
                          hourCycle={24}
                          granularity="minute"
                          displayFormat={{ hour24: "dd/MM/yyyy HH:mm" }}
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-muted-foreground mt-1.5 text-sm">
                        <FontAwesomeIcon icon={faClock} className="mr-1 h-3 w-3" />
                        Select the start time for your raid. Times are displayed in 1-hour windows for better planning.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location and Max Participants Row */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground mb-2 flex items-center gap-2 text-base font-semibold">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary h-4 w-4" />
                          Location
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Black Zone, Royal City..." className="h-12 text-base" {...field} />
                        </FormControl>
                        <FormDescription className="text-muted-foreground mt-1.5 text-sm">
                          Where will the raid take place?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Max Participants */}
                  <FormField
                    control={form.control}
                    name="maxParticipants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground mb-2 flex items-center gap-2 text-base font-semibold">
                          <FontAwesomeIcon icon={faUsers} className="text-primary h-4 w-4" />
                          Max Participants
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="20"
                            className="h-12 text-base font-medium"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription className="text-muted-foreground mt-1.5 text-sm">
                          Maximum number of participants (1-50)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>

          {/* Footer Actions */}
          <div className="border-border bg-muted/30 border-t px-6 py-6">
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
                onClick={form.handleSubmit(handleSubmit)}
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2 h-4 w-4" />
                Create Raid
              </Button>
            </div>
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
