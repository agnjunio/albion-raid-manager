import { type Guild, type GuildMember } from "@albion-raid-manager/core/types";
import Link from "next/link";

interface GuildCardProps {
  guild: Guild & {
    members: GuildMember[];
  };
}

export function GuildCard({ guild }: GuildCardProps) {
  return (
    <Link
      href={`/guilds/${guild.id}`}
      className="w-100 hover:bg-primary-gray-500/25 active:bg-primary-gray-500/50 min-h-28 cursor-pointer overflow-hidden rounded bg-white transition-colors dark:bg-gray-800/25"
    >
      <div className="flex h-full items-center justify-center px-6 py-4">
        <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{guild.name}</div>
      </div>
    </Link>
  );
}
