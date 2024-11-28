"use client";

import { Composition } from "@albion-raid-manager/database/models";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { addMinutes, format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";

type CreateRaidProps = {
  id: string;
  compositions: Array<{ id: number; name: string }>;
};

export default function CreateRaid({ id, compositions }: CreateRaidProps) {
  const getNext30MinuteStep = () => {
    const now = new Date();
    const rounded = addMinutes(now, 30 - (now.getMinutes() % 30));
    return format(rounded, "yyyy-MM-dd'T'HH:mm");
  };

  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState(getNext30MinuteStep());
  const [composition, setComposition] = React.useState<Composition | null>(null);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const filteredCompositions = useMemo<typeof compositions>(() => {
    if (!query) return compositions;
    return compositions.filter((composition) => composition.name.toLowerCase().includes(query.toLowerCase()));
  }, [query, compositions]);

  const createRaid: React.FormEventHandler = async (event) => {
    event.preventDefault();

    if (!composition) return;

    const res = await fetch(`/api/raids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description, date, compositionId: composition.id, guildId: Number(id) }),
    });

    if (!res.ok) {
      const body = await res.json();
      return alert(body.message);
    }

    router.push(`/guilds/${id}`);
  };

  return (
    <>
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
          <Combobox value={composition} onChange={(value) => setComposition(value)} onClose={() => setQuery("")}>
            <div
              className="relative w-full flex group"
              role="combobox"
              aria-controls="combobox-options"
              aria-expanded={filteredCompositions.length > 0}
            >
              <ComboboxInput
                id="composition"
                displayValue={(composition: Composition) => composition?.name}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
                placeholder="Select a composition..."
              />
              <ComboboxButton>
                <FontAwesomeIcon icon={faChevronDown} width={12} height={12} />
              </ComboboxButton>
            </div>

            <ComboboxOptions anchor="bottom start" transition>
              {filteredCompositions.map((composition) => (
                <ComboboxOption key={composition.id} value={composition} className="flex gap-2 items-center">
                  <FontAwesomeIcon icon={faCheck} className="basis-6" />
                  <div className="text-sm/6 text-white">{composition.name}</div>
                </ComboboxOption>
              ))}
            </ComboboxOptions>
          </Combobox>
        </div>
        <div className="flex gap-2 flex-row-reverse">
          <button type="submit">Create</button>
          <Link href={`/guilds/${id}`}>
            <button className="btn-secondary-violet">Cancel</button>
          </Link>
        </div>
      </form>
    </>
  );
}
