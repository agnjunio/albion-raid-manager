import { Guild } from "@prisma/client";
import Link from "next/link";
import React from "react";

interface GuildCardProps {
  guild: Guild;
}

const GuildCard: React.FC<GuildCardProps> = ({ guild }) => {
  return (
    <Link
      href={`/guilds/${guild.id}`}
      className="w-100 min-h-28 rounded overflow-hidden bg-white dark:bg-primary-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-primary-gray-700 transition-colors duration-300"
    >
      <div className="px-6 py-4 h-full flex items-center justify-center">
        <div className="font-bold text-xl text-primary-gray-900 dark:text-primary-gray-100">{guild.name}</div>
      </div>
    </Link>
  );
};

export default GuildCard;
