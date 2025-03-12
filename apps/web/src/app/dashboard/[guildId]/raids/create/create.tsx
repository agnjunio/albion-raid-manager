"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { Composition } from "@albion-raid-manager/database/models";
import { faCheck, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, startOfDay } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type CreateRaidProps = {
  guildId: string;
  compositions: Composition[];
};

const today = startOfDay(Date.now());
const maxDate = addMonths(today, 2);

const formSchema = z.object({
  description: z
    .string()
    .min(6, { message: "Description should contain at least 6 characters" })
    .max(50, { message: "Description should not exceed 50 characters." }),
  date: z
    .date()
    .min(today, { message: "Start date must be today or later." })
    .max(maxDate, { message: "Start date cannot be more than 2 months ahead." }),
  composition: z.custom<Composition>().refine((val) => val !== undefined, { message: "Please select a composition " }),
});

export default function CreateRaid({ guildId, compositions }: CreateRaidProps) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      date: today,
    },
  });
  const [compositionsOpen, setCompositionsOpen] = useState(false);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
  };

  return (
    <Card className="p-8">
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
                  <Popover open={compositionsOpen} onOpenChange={setCompositionsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        role="combobox"
                        variant="outline"
                        aria-expanded={compositionsOpen}
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
                                onSelect={() => field.onChange(composition)}
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

          <div className="flex gap-2 flex-row-reverse">
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
