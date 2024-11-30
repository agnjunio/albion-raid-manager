"use client";

import { filterCompositions } from "@/helpers/compositions";
import { Prisma } from "@albion-raid-manager/database/models";
import Link from "next/link";
import { useMemo, useState } from "react";

type CompositionListProps = {
  compositions: Prisma.CompositionGetPayload<{
    include: {
      _count: {
        select: {
          slots: true;
        };
      };
    };
  }>[];
};

export default function CompositionList({ compositions }: CompositionListProps) {
  const [filter, setFilter] = useState("");

  const filteredCompositions = useMemo(() => {
    return filterCompositions(compositions, filter);
  }, [compositions, filter]) as unknown as typeof compositions;

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex justify-between items-center gap-2">
        <input
          type="text"
          placeholder="Search..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg p-2"
        />

        <div className="flex gap-2 flex-row-reverse">
          <Link href="compositions/create" tabIndex={-1}>
            <button className="whitespace-nowrap">New Composition</button>
          </Link>
        </div>
      </div>

      <ul className="space-y-2">
        {filteredCompositions.map((composition) => (
          <li key={composition.id}>
            <Link
              href={`compositions/${composition.id}`}
              className="flex justify-between gap-4 p-4 items-center rounded-lg bg-primary-gray-800/25 cursor-pointer hover:bg-primary-gray-500/25 active:bg-primary-gray-500/50 transition-colors outline-offset-0"
            >
              <div>
                <div className="grow text-lg/tight font-semibold">{composition.name}</div>
                <div className="text-xs text-secondary-violet">Size: {composition._count.slots}</div>
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
