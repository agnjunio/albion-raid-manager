"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import Loading from "@/components/ui/loading";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { Composition } from "@albion-raid-manager/database/models";
import { faCheckSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addMinutes, format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";
import { Card } from "../../../../../components/ui/card";

type CreateRaidProps = {
  id: string;
  compositions: Composition[];
};

export default function CreateRaid({ id, compositions }: CreateRaidProps) {
  const getNext30MinuteStep = () => {
    const now = new Date();
    const rounded = addMinutes(now, 30 - (now.getMinutes() % 30));
    return format(rounded, "yyyy-MM-dd'T'HH:mm");
  };

  const router = useRouter();
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getNext30MinuteStep());
  const [loading, setLoading] = useState(false);

  const [compositionsOpen, setCompositionsOpen] = useState(false);
  const [selectedComposition, setSelectedComposition] = useState<Composition | null>(null);

  const createRaid: FormEventHandler = async (event) => {
    event.preventDefault();

    try {
      if (!selectedComposition) throw new Error("Composition is required");

      setLoading(true);
      const response = await fetch(`/api/raids`, {
        method: "POST",
        body: JSON.stringify({ description, date, compositionId: selectedComposition.id, guildId: Number(id) }),
      });
      if (!response.ok) throw new Error("Failed to create raid");
      router.push(`/guilds/${id}/raids`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <Card>
      <form onSubmit={createRaid} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Description
          </label>
          <input
            id="description"
            type="text"
            className="w-full"
            value={description}
            placeholder="Enter raid description..."
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="start" className="block text-sm font-medium">
            Start Time
          </label>
          <input
            id="start"
            type="datetime-local"
            className="w-full"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            step="1800" // 30 minutes in seconds
            min={new Date().toISOString().split("T")[0] + "T00:00"}
          />
        </div>

        <div>
          <label htmlFor="composition" className="block text-sm font-medium">
            Composition
          </label>

          <Popover open={compositionsOpen} onOpenChange={setCompositionsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={compositionsOpen} className="w-full">
                {selectedComposition ? selectedComposition.name : "Select a composition..."}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search composition" />
                <CommandList>
                  <CommandEmpty>No compositions found.</CommandEmpty>
                  <CommandGroup>
                    {compositions.map((composition) => (
                      <CommandItem
                        key={composition.id}
                        value={composition.name}
                        onSelect={() => {
                          setSelectedComposition(composition === selectedComposition ? null : composition);
                          setCompositionsOpen(false);
                        }}
                      >
                        <div className="flex justify-center gap-2">
                          <FontAwesomeIcon
                            icon={faCheckSquare}
                            className={cn("size-4 opacity-0", {
                              "opacity-100": selectedComposition === composition,
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
        </div>
        <div className="flex gap-2 flex-row-reverse">
          <button type="submit">Create</button>
          <Link href={`/guilds/${id}/raids`}>
            <button className="btn-secondary-violet">Cancel</button>
          </Link>
        </div>
      </form>
    </Card>
  );
}
