"use client";

import { createRaid } from "@/actions/raids";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { translateErrorCode } from "@/lib/errors";
import { raidFormSchema } from "@/lib/schemas/raid";
import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { Composition } from "@albion-raid-manager/database/models";
import { faCheck, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type CreateRaidProps = {
  guildId: string;
  compositions: Composition[];
};

export default function CreateRaid({ guildId, compositions }: CreateRaidProps) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const form = useForm<z.infer<typeof raidFormSchema>>({
    resolver: zodResolver(raidFormSchema),
    defaultValues: {
      description: "",
      date: new Date(),
    },
  });

  const handleSubmit = async (data: z.infer<typeof raidFormSchema>) => {
    const response = await createRaid(guildId, data);

    if (!response.success) {
      return setError(response.error);
    }

    router.push(`/dashboard/${guildId}/raids`);
  };

  return (
    <Card className="p-8">
      {error && <Alert>{translateErrorCode(error)}</Alert>}
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
                    yearRange={0}
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

          <FormField
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
                          {field.value ? field.value.name : "Select a composition..."}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0">
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
          />

          <div className="flex flex-row-reverse gap-2">
            <Button type="submit">Create</Button>
            <Link href={`/dashboard/${guildId}/raids`} tabIndex={-1}>
              <Button variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Form>
    </Card>
  );
}
