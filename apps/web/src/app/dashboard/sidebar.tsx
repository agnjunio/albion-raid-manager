"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { getServerPictureUrl, getUserPictureUrl } from "@albion-raid-manager/common/helpers/discord";
import {
  faArrowRightFromBracket,
  faCheck,
  faChevronDown,
  faFlag,
  faGear,
  faPeopleGroup,
  faPlus,
  faShield,
  faShieldHalved,
  faUsers,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useDashboardContext } from "./context";
import { GuildWithMembers } from "./types";

const links = [
  { href: "raids", label: "Raids", icon: faFlag },
  { href: "compositions", label: "Compositions", icon: faPeopleGroup },
  { href: "builds", label: "Builds", icon: faShieldHalved },
  { href: "members", label: "Members", icon: faUsers },
  { href: "settings", label: "Settings", icon: faGear },
];

interface GuildSelectionProps {
  guild?: GuildWithMembers;
  icon?: IconDefinition;
}

export function DashboardSidebar() {
  const { guilds, selectedGuild } = useDashboardContext();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <GuildSelection guild={selectedGuild} icon={faChevronDown} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-60" align="start">
            {guilds.map((guild) => (
              <Link key={guild.id} href={`/dashboard/${guild.id}`}>
                <DropdownMenuItem>
                  <GuildSelection guild={guild} icon={guild === selectedGuild ? faCheck : undefined} />
                </DropdownMenuItem>
              </Link>
            ))}
            {guilds.length > 0 && <DropdownMenuSeparator />}
            <Link href="/create">
              <DropdownMenuItem>
                <FontAwesomeIcon icon={faPlus} className="size-4" />
                <div className="leading-normal">Create Guild</div>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        {selectedGuild && (
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.label}>
                  <SidebarMenuButton asChild>
                    <Link href={`/dashboard/${selectedGuild.id}/${link.href}`}>
                      <FontAwesomeIcon icon={link.icon} />
                      <span>{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserInfo />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function GuildSelection({ guild, icon }: GuildSelectionProps) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={cn(
          "flex aspect-square size-8 items-center justify-center text-sidebar-primary-foreground relative",
          { "bg-sidebar-primary rounded-lg": !guild },
        )}
      >
        {guild ? (
          <Avatar>
            <AvatarImage src={getServerPictureUrl(guild.discordId, guild.icon)} />
            <AvatarFallback>{guild.name?.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <FontAwesomeIcon icon={faShield} className="size-4" />
        )}
      </div>

      <div className={cn("flex flex-col leading-right grow whitespace-nowrap min-w-0")}>
        <span className="font-semibold truncate">{guild ? guild.name : "Select Guild"} </span>
        <span className="text-xs text-muted-foreground">
          {guild ? `${guild.members.length} member${guild.members.length !== 1 ? "s" : ""}` : "No Guild Selected"}
        </span>
      </div>

      {icon && <FontAwesomeIcon icon={icon} className="ml-auto size-4 data-[state=collapsed]:hidden" />}
    </div>
  );
}

export function UserInfo() {
  const session = useSession();
  if (!session?.data?.user) return null;

  const { user } = session.data;
  return (
    <>
      <div className="flex items-center gap-2 min-w-0">
        <Avatar>
          <AvatarImage src={user.image || getUserPictureUrl(user.id)} />
          <AvatarFallback>{user.name?.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col text-sm min-w-0 group-data-[collapsible=icon]:hidden">
          <span className="font-semibold truncate">@{user.name || "Unknown User"}</span>
          <span className="text-xs leading-tight truncate">{user.email}</span>
        </div>
      </div>

      <SidebarMenuAction
        onClick={() =>
          signOut({
            callbackUrl: "/",
          })
        }
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      </SidebarMenuAction>
    </>
  );
}
