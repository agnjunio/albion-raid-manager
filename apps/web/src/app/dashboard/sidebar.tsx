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
import { cn } from "@albion-raid-manager/core/helpers";
import type { Guild } from "@albion-raid-manager/core/types";
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
import { useDashboard } from "./context";
interface GuildSelectionProps {
  guild?: Guild;
  icon?: IconDefinition;
}

export function DashboardSidebar() {
  const { fetchGuilds, selectedGuild } = useDashboard();
  const guilds = fetchGuilds.data ?? [];
  console.log("🚀 ~ sidebar.tsx:50 ~ DashboardSidebar ~ guilds:", guilds);
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
              <GuildSelection guild={selectedGuild} icon={faChevronDown} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-60" align="start">
            {fetchGuilds.isLoading && (
              <DropdownMenuItem>
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </DropdownMenuItem>
            )}
            {guilds?.map((guild) => (
              <Link key={guild.id} to={`/dashboard/${guild.id}`}>
                <DropdownMenuItem>
                  <GuildSelection guild={guild} icon={guild === selectedGuild ? faCheck : undefined} />
                </DropdownMenuItem>
              </Link>
            ))}
            {guilds?.length && <DropdownMenuSeparator />}
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

export function GuildSelection({ guild, icon }: GuildSelectionProps) {
  return (
    <div className="flex w-full items-center gap-2">
      <div
        className={cn(
          "text-sidebar-primary-foreground relative flex aspect-square size-8 items-center justify-center",
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

      <div className={cn("leading-right flex min-w-0 grow flex-col whitespace-nowrap")}>
        <span className="truncate font-semibold">{guild ? guild.name : "Select server"} </span>
        <span className="text-muted-foreground text-xs">{!guild && "No server selected"}</span>
      </div>

      {icon && <FontAwesomeIcon icon={icon} className="ml-auto size-4 data-[state=collapsed]:hidden" />}
    </div>
  );
}

export function UserInfo() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        <Avatar>
          <AvatarImage src={user.avatar || getUserPictureUrl(user.id)} />
          <AvatarFallback>{user.username?.substring(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-col text-sm group-data-[collapsible=icon]:hidden">
          <span className="truncate font-semibold">@{user.username || "Unknown User"}</span>
        </div>
      </div>

      <SidebarMenuAction onClick={() => signOut()}>
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      </SidebarMenuAction>
    </>
  );
}
