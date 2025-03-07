import { Guild, GuildMember } from "@albion-raid-manager/database/models";
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
      className="w-100 min-h-28 rounded overflow-hidden bg-white dark:bg-gray-800/25 cursor-pointer hover:bg-primary-gray-500/25 active:bg-primary-gray-500/50 transition-colors"
    >
      <div className="px-6 py-4 h-full flex items-center justify-center">
        <div className="font-bold text-xl text-gray-900 dark:text-gray-100">{guild.name}</div>
      </div>
    </Link>
  );
}
