"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { use } from "react";

type CreateRaidPageParams = {
  params: Promise<{
    id: string;
  }>;
};

export default function CreateRaidPage({ params }: CreateRaidPageParams) {
  const { id } = use(params);
  const [description, setDescription] = React.useState("");
  const [date, setDate] = React.useState("");
  const [compositionId, setCompositionId] = React.useState(1);
  const router = useRouter();

  const createRaid: React.FormEventHandler = async (event) => {
    event.preventDefault();

    const res = await fetch(`/api/raids`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description, date, compositionId, guildId: Number(id) }),
    });

    if (!res.ok) {
      const body = await res.json();
      return alert(body.message);
    }

    router.push(`/guilds/${id}`);
  };

  return (
    <div className="p-4 space-y-2 flex flex-col items-center">
      <h1 className="text-2xl font-semibold text-center">Create Raid</h1>
      <div className="bg-primary-gray-50/5 w-full max-w-lg p-6 rounded-lg border border-gray-800/5">
        <form onSubmit={createRaid} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Description</label>
            <input
              name="description"
              type="text"
              className="w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input name="date" type="date" className="w-full" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Composition</label>
            <input
              name="composition"
              type="text"
              className="w-full"
              value={compositionId}
              onChange={(e) => setCompositionId(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2 flex-row-reverse">
            <button type="submit">Create</button>
            <Link href={`/guilds/${id}`}>
              <button className="btn-secondary-violet">Cancel</button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
