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
  const { guildId } = useParams();
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
      params: { serverId: guildId as string },
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
      <PageTitle>New Raid</PageTitle>

      <div className="flex justify-center">
        <div className="W-full max-w-xl">
          <Card className="p-8">
            {error && <Alert>{error}</Alert>}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 lg:space-y-8">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter raid description..." {...field} />
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
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <DateTimePicker
                          hourCycle={24}
                          granularity="minute"
                          displayFormat={{ hour24: "dd/MM/yyyy HH:mm" }}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The start time is in your local timezone. Conversions will be done automatically.
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

                <div className="flex flex-row-reverse gap-2">
                  <Button type="submit">Create</Button>
                  <Link to={`..`} tabIndex={-1}>
                    <Button variant="secondary">Cancel</Button>
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
