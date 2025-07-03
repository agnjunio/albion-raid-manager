import { type FormEventHandler, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import Loading from "@/components/ui/loading";

type CreateCompositionProps = {
  guildId: string;
};

export default function CreateComposition({ guildId }: CreateCompositionProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createComposition: FormEventHandler = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`/api/compositions`, {
        method: "POST",
        body: JSON.stringify({ guildId, name }),
      });
      if (!response.ok) throw new Error("Failed to create composition");
      navigate(`/guilds/${guildId}/compositions`);
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

      <div className="flex flex-row-reverse gap-2">
        <button type="submit">Create</button>
        <Link to={`/guilds/${guildId}/compositions`}>
          <button className="btn-secondary-violet">Cancel</button>
        </Link>
      </div>
    </form>
  );
}
