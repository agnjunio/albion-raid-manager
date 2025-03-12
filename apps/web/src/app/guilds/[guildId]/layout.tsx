import Alert from "@/components/ui/alert";
import { nextAuthOptions } from "@/lib/auth";
import { prisma } from "@albion-raid-manager/database";
import {
  faArrowRightFromBracket,
  faFlag,
  faGear,
  faPeopleGroup,
  faShieldHalved,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GuildLayoutProps } from "./types";

const links = [
  { href: "raids", label: "Raids", icon: faFlag },
  { href: "compositions", label: "Compositions", icon: faPeopleGroup },
  { href: "builds", label: "Builds", icon: faShieldHalved },
  { href: "members", label: "Members", icon: faUsers },
  { href: "settings", label: "Settings", icon: faGear },
];

export default async function Layout({ params, children }: GuildLayoutProps) {
  const session = await getServerSession(nextAuthOptions);
  if (!session) return redirect("/");

  const { guildId } = await params;
  const guild = await prisma.guild.findUnique({
    where: {
      id: Number(guildId),
    },
    include: { raids: true, members: true },
  });

  const isMember = guild?.members.some((member) => member.userId === session.user.id);

  if (!guild) {
    redirect("/guilds");
  }
  if (!isMember) {
    return (
      <div className="flex flex-col gap-2 justify-center items-center size-full">
        <Alert>FORBIDDEN: You are not part of this guild.</Alert>
        <Link href="/guilds" tabIndex={-1}>
          <button className="py-1">Back</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grow flex">
      <div className="min-w-48 sm:w-64 md:w-72 lg:w-80 bg-primary-gray-900/50 text-white drop-shadow-lg">
        <div className="p-4 pr-2 flex justify-between items-center bg-secondary-violet-800">
          <div className="text-lg font-medium">{guild.name}</div>
          <Link href="/guilds" tabIndex={-1}>
            <button role="icon-button" className="size-8">
              <FontAwesomeIcon icon={faArrowRightFromBracket} />
            </button>
          </Link>
        </div>
        <ul className="divide-y divide-secondary-violet">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={`/guilds/${guild.id}/${link.href}`}
                className="px-4 py-2 flex gap-4 items-center hover:bg-primary-gray-500/25 active:bg-primary-gray-500/50 transition-colors outline-offset-0"
              >
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
