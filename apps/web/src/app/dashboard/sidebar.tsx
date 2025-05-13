import type { Guild } from "@albion-raid-manager/core/types";

import { cn } from "@albion-raid-manager/core/helpers";
import { getServerPictureUrl, getUserPictureUrl } from "@albion-raid-manager/discord/helpers";
import {
  faArrowRightFromBracket,
  faCheck,
  faChevronDown,
  faPlus,
  faShield,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { useMenu } from "@/lib/menu";

import { useDashboard } from "./context";

export function DashboardSidebar() {
  const { fetchGuilds, selectedGuild } = useDashboard();
  const guilds = fetchGuilds.data ?? [];
  const links = useMenu();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <GuildSelection guild={selectedGuild} icon={faChevronDown} isLoading={fetchGuilds.isLoading} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-60" align="start">
            {guilds.map((guild) => (
              <Link key={guild.id} to={`/dashboard/${guild.id}`}>
                <DropdownMenuItem>
                  <GuildSelection guild={guild} icon={guild === selectedGuild ? faCheck : undefined} />
                </DropdownMenuItem>
              </Link>
            ))}
            {guilds.length > 0 && <DropdownMenuSeparator />}
            <Link to="/create">
              <DropdownMenuItem>
                <FontAwesomeIcon icon={faPlus} className="size-4" />
                <div className="leading-normal">Add Server</div>
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
                <Collapsible defaultOpen key={link.label}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton asChild>
                        <Link to={link.submenu ? "#" : `/dashboard/${selectedGuild.id}/${link.href}`}>
                          {link.icon && <FontAwesomeIcon icon={link.icon} />}
                          <span>{link.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {link.submenu && (
                        <SidebarMenuSub>
                          {link.submenu.map((sublink) => (
                            <SidebarMenuSubButton asChild key={sublink.href}>
                              <Link to={`/dashboard/${selectedGuild.id}/${link.href}/${sublink.href}`}>
                                <span className="pl-1.5">{sublink.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          ))}
                        </SidebarMenuSub>
                      )}
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
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

interface GuildSelectionProps {
  guild?: Guild;
  icon?: IconDefinition;
  isLoading?: boolean;
}

export function GuildSelection({ guild, icon, isLoading }: GuildSelectionProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <div
        className={cn(
          "text-sidebar-primary-foreground relative flex aspect-square size-8 items-center justify-center",
          { "bg-sidebar-primary rounded-lg": !guild },
        )}
      >
        {isLoading ? (
          <Skeleton className="size-8" />
        ) : guild ? (
          <Avatar>
            <AvatarImage src={getServerPictureUrl(guild.discordId, guild.icon)} />
            <AvatarFallback>{guild.name?.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <FontAwesomeIcon icon={faShield} className="size-4" />
        )}
      </div>

      {isLoading ? (
        <div className={cn("flex min-w-0 grow flex-col gap-1")}>
          <Skeleton className="bg-muted h-3 w-24" />
          <Skeleton className="bg-muted-foreground h-3 w-24" />
        </div>
      ) : (
        <div className={cn("leading-right flex min-w-0 grow flex-col whitespace-nowrap")}>
          <span className="truncate font-semibold">{guild ? guild.name : "Select server"} </span>
          <span className="text-muted-foreground text-xs">{!guild && "No server selected"}</span>
        </div>
      )}

      {icon && <FontAwesomeIcon icon={icon} className="ml-auto size-4 data-[state=collapsed]:hidden" />}
    </div>
  );
}

export function UserInfo() {
  const { user, signOut, status } = useAuth();

  if (status === "loading" || !user)
    return (
      <div className="flex min-w-0 items-center gap-2">
        <Skeleton className="size-8" />
        <Skeleton className="bg-muted h-3 w-24" />
      </div>
    );

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <Avatar>
          <AvatarImage src={getUserPictureUrl(user.id, user.avatar)} />
          <AvatarFallback>{user.username.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col text-sm leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate font-semibold">{user.nickname || "Unknown User"}</span>
          <span className="text-muted-foreground text-xs">@{user.username}</span>
        </div>
      </div>

      <SidebarMenuAction onClick={() => signOut()}>
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      </SidebarMenuAction>
    </>
  );
}
