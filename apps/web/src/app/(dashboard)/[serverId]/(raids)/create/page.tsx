import type { CreateRaid } from "@albion-raid-manager/core/types/api/raids";
import type { z } from "zod";

import { useState } from "react";

import { APIErrorType } from "@albion-raid-manager/core/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";

import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Page, PageTitle } from "@/components/ui/page";
import { isAPIError } from "@/lib/api";
import { useCreateRaidMutation } from "@/store/raids";

import { raidFormSchema } from "./schemas";

export function CreateRaidPage() {
  const navigate = useNavigate();
  const { serverId } = useParams();
  const [createRaid] = useCreateRaidMutation();
  const [error, setError] = useState<APIErrorType | null>(null);
  const form = useForm<z.infer<typeof raidFormSchema>>({
    resolver: zodResolver(raidFormSchema),
    defaultValues: {
      description: "",
      date: new Date(),
    },
  });

  const handleSubmit = async (data: z.infer<typeof raidFormSchema>) => {
    const body: CreateRaid.Body = {
      title: "Raid",
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
      navigate(`../${createRaidResponse.data.raid.id}`, { replace: true });
    }
  };

  return (
    <Page>
      <div className="mb-8 space-y-2 text-center">
        <PageTitle className="text-3xl font-bold">Create New Raid</PageTitle>
        <p className="text-muted-foreground text-lg">Schedule and organize your guild&apos;s next adventure</p>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <Card className="bg-card/50 border-0 p-8 shadow-lg backdrop-blur-sm">
            {error && <Alert className="mb-6">{error}</Alert>}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 lg:space-y-8">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Raid Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a detailed description of your raid..."
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Start Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          hourCycle={24}
                          granularity="hour"
                          displayFormat={{ hour24: "dd/MM/yyyy HH:00" }}
                          className="h-12 text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-sm">
                        Select the start time for your raid. Times are displayed in 1-hour windows for better planning.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="composition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Composition</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              role="combobox"
                              variant="outline"
                              className="w-full justify-start"
                              disabled={field.disabled}
                            >
                              <div className="flex items-center gap-2">
                                <FontAwesomeIcon icon={faPeopleGroup} className="size-4" />
                                {field.value ? field.value.name : "Open party composition"}
                              </div>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
                            <Command>
                              <CommandInput placeholder="Search composition" />
                              <CommandList>
                                <CommandEmpty>No compositions found.</CommandEmpty>
                                <CommandGroup>
                                  {compositions.map((composition) => (
                                    <CommandItem
                                      key={composition.id}
                                      value={composition.name}
                                      onSelect={() =>
                                        field.onChange(field.value?.id !== composition.id ? composition : undefined)
                                      }
                                    >
                                      <div className="flex items-center gap-2">
                                        <FontAwesomeIcon
                                          icon={faCheck}
                                          className={cn("size-4 opacity-0 transition-all ease-in-out", {
                                            "opacity-100": field.value?.id === composition.id,
                                          })}
                                        />
                                        {composition.name}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormDescription>
                        Leave this field blank if you do not wish to use a predefined composition in this raid.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}

                <div className="flex flex-row-reverse gap-4 pt-4">
                  <Button type="submit" size="lg" className="px-8">
                    Create Raid
                  </Button>
                  <Link to={`..`} tabIndex={-1}>
                    <Button variant="secondary" size="lg" className="px-8">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </Page>
  );
}
