"use client";

import Loading from "@/components/Loading";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEventHandler, useState } from "react";

type CreateCompositionProps = {
  guildId: string;
};

export default function CreateComposition({ guildId }: CreateCompositionProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createComposition: FormEventHandler = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`/api/compositions`, {
        method: "POST",
        body: JSON.stringify({ guildId, name }),
      });
      if (!response.ok) throw new Error("Failed to create composition");
      router.push(`/guilds/${guildId}/compositions`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <form onSubmit={createComposition} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          className="w-full"
          value={name}
          placeholder="Enter composition name..."
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="flex gap-2 flex-row-reverse">
        <button type="submit">Create</button>
        <Link href={`/guilds/${guildId}/compositions`}>
          <button className="btn-secondary-violet">Cancel</button>
        </Link>
      </div>
    </form>
  );
}
