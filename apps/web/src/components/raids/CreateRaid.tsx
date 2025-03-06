"use client";

import Loading from "@/components/ui/loading";
import { filterCompositions } from "@/helpers/compositions";
import { Composition } from "@albion-raid-manager/database/models";
import { faCheck, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { addMinutes, format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useMemo, useState } from "react";

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

  const [description, setDescription] = useState("");
  const [date, setDate] = useState(getNext30MinuteStep());
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [composition, setComposition] = useState<Composition | null>(null);
  const router = useRouter();

  const filteredCompositions = useMemo(() => {
    return filterCompositions(compositions, filter);
  }, [compositions, filter]);

  const createRaid: FormEventHandler = async (event) => {
    event.preventDefault();

    try {
      if (!composition) throw new Error("Composition is required");

      setLoading(true);
      const response = await fetch(`/api/raids`, {
        method: "POST",
        body: JSON.stringify({ description, date, compositionId: composition.id, guildId: Number(id) }),
      });
      if (!response.ok) throw new Error("Failed to create raid");
      router.push(`/guilds/${id}/raids`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  return (
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
        <Combobox value={composition} onChange={(value) => setComposition(value)} onClose={() => setFilter("")}>
          <div
            className="relative w-full flex group"
            role="combobox"
            aria-controls="combobox-options"
            aria-expanded={filteredCompositions.length > 0}
          >
            <ComboboxInput
              id="composition"
              displayValue={(composition: Composition) => composition?.name}
              onChange={(e) => setFilter(e.target.value)}
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
                <div className="text-sm/6">{composition.name}</div>
              </ComboboxOption>
            ))}
            {filteredCompositions.length === 0 && (
              <ComboboxOption disabled value={null}>
                <div className="text-sm/6">No compositions found</div>
              </ComboboxOption>
            )}
          </ComboboxOptions>
        </Combobox>
      </div>
      <div className="flex gap-2 flex-row-reverse">
        <button type="submit">Create</button>
        <Link href={`/guilds/${id}/raids`}>
          <button className="btn-secondary-violet">Cancel</button>
        </Link>
      </div>
    </form>
  );
}
