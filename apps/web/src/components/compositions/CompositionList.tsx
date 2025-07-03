import { useMemo, useState } from "react";

import { type Composition } from "@albion-raid-manager/core/types";
import { compareAsc } from "date-fns";
import { distance } from "fastest-levenshtein";
import { Link } from "react-router-dom";

export function filterCompositions(compositions: Composition[], filter: string) {
  return compositions
    .map((composition) => ({
      ...composition,
      distance: composition.name.length - distance(composition.name.toLowerCase(), filter.toLowerCase()),
    }))
    .filter((composition) => composition.distance >= 0)
    .sort((a, b) => compareAsc(new Date(a.updatedAt), new Date(b.updatedAt)))
    .sort((a, b) => b.distance - a.distance)
    .map((composition) => ({ ...composition, distance: undefined }));
}

type CompositionListProps = {
  compositions: Composition[];
};

export default function CompositionList({ compositions }: CompositionListProps) {
  const [filter, setFilter] = useState("");

  const filteredCompositions = useMemo(() => {
    return filterCompositions(compositions, filter);
  }, [compositions, filter]) as unknown as typeof compositions;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg p-2"
        />

        <div className="flex flex-row-reverse gap-2">
          <Link to="compositions/create" tabIndex={-1}>
            <button className="whitespace-nowrap">New Composition</button>
          </Link>
        </div>
      </div>

      <ul className="space-y-2">
        {filteredCompositions.map((composition) => (
          <li key={composition.id}>
            <Link
              to={`compositions/${composition.id}`}
              className="bg-primary-gray-800/25 hover:bg-primary-gray-500/25 active:bg-primary-gray-500/50 flex cursor-pointer items-center justify-between gap-4 rounded-lg p-4 outline-offset-0 transition-colors"
            >
              <div>
                <div className="grow text-lg/tight font-semibold">{composition.name}</div>
                <div className="text-secondary-violet text-xs">Size: {composition.builds?.length ?? 0}</div>
              </div>
              <div>
                Last Update:{" "}
                {new Date(composition.updatedAt).toLocaleString(navigator.language, {
                  day: "numeric",
                  month: "2-digit",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </Link>
          </li>
        ))}
        {filteredCompositions.length === 0 && <p className="flex items-center justify-center">No compositions.</p>}
      </ul>
    </div>
  );
}
