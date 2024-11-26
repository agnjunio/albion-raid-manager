import { prisma } from "@albion-raid-manager/database";
import {
  faArrowRightFromBracket,
  faFlag,
  faGear,
  faPeopleGroup,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

type LayoutProps = {
  params: Promise<{
    id: string;
  }>;
  children: React.ReactNode;
};

const links = [
  { href: "raids", label: "Raids", icon: faFlag },
  { href: "compositions", label: "Compositions", icon: faPeopleGroup },
  { href: "builds", label: "Builds", icon: faShieldHalved },
  { href: "settings", label: "Settings", icon: faGear },
];

export default async function Layout({ params, children }: LayoutProps) {
  const { id } = await params;
  const guild = await prisma.guild.findUnique({
    where: {
      id: Number(id),
    },
    include: { raids: true },
  });

  if (!guild) {
    redirect("/guilds");
  }

  return (
    <div className="grow flex">
      <div className="w-48 sm:w-64 md:w-72 lg:w-80 bg-primary-gray-900/50 text-white">
        <div className="p-4 pr-2 flex justify-between items-center bg-secondary-violet-800">
          <div className="text-lg font-medium">{guild.name}</div>
          <Link href=".." tabIndex={-1}>
            <button role="icon-button" className="size-8">
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>
          </Link>
        </div>
        <ul className="divide-y divide-secondary-violet">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="px-4 py-2 hover:bg-primary-yellow-600/25 flex gap-4 items-center">
                <FontAwesomeIcon icon={link.icon} width={16} height={16} className="-mt-[1px]" />
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="grow">{children}</div>
    </div>
  );
}
