import { useMemo } from "react";

import { getServerPictureUrl, getUserPictureUrl } from "@albion-raid-manager/discord/helpers";
import { DiscordServer } from "@albion-raid-manager/types/api";
import {
  faArrowRightFromBracket,
  faCheck,
  faChevronCircleLeft,
  faChevronDown,
  faCog,
  faCrown,
  faShield,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, NavLink, useParams } from "react-router-dom";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { useGetServersQuery } from "@/store/servers";

const navigation = [
  { name: "Raids", href: "raids", icon: faShield },
  { name: "Settings", href: "settings", icon: faCog },
];

export function DashboardSidebar() {
  const { serverId } = useParams<{ serverId: string }>();
  const { data, isLoading } = useGetServersQuery();

  const servers = useMemo(() => data?.servers.filter((server) => server.bot), [data]);
  const selectedServer = useMemo(() => servers?.find((server) => server.id === serverId), [servers, serverId]);

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <ServerInfo server={selectedServer} icon={faChevronDown} isLoading={isLoading} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-60" align="start">
            {servers?.map((server) => (
              <Link key={server.id} to={`/dashboard/${server.id}`}>
                <DropdownMenuItem>
                  <ServerInfo server={server} icon={server === selectedServer ? faCheck : undefined} />
                </DropdownMenuItem>
              </Link>
            ))}
            {servers && servers.length > 0 && <DropdownMenuSeparator />}
            <Link to="/dashboard">
              <DropdownMenuItem>
                <FontAwesomeIcon icon={faChevronCircleLeft} className="size-4" />
                <div className="leading-normal">Back to dashboard</div>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={`/dashboard/${serverId}/${item.href}`}
                    className={({ isActive }) =>
                      cn("flex items-center gap-2", isActive && "bg-sidebar-accent text-sidebar-accent-foreground")
                    }
                  >
                    <FontAwesomeIcon icon={item.icon} className="size-4" />
                    <span>{item.name}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
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

interface ServerInfoProps {
  server?: DiscordServer;
  icon?: IconDefinition;
  isLoading?: boolean;
}

export function ServerInfo({ server, icon, isLoading }: ServerInfoProps) {
  const badge = useMemo(() => {
    if (server?.owner) {
      return (
        <Badge variant="outline" size="xs">
          <FontAwesomeIcon icon={faCrown} className="text-primary mr-1 size-3" />
          Owner
        </Badge>
      );
    }

    if (server?.admin && !server.owner) {
      return (
        <Badge variant="outline" size="xs">
          <FontAwesomeIcon icon={faShield} className="text-secondary mr-1 size-3" />
          Admin
        </Badge>
      );
    }

    return null;
  }, [server]);

  return (
    <div className="flex w-full items-center gap-2">
      <div
        className={cn(
          "text-sidebar-primary-foreground relative flex aspect-square size-8 items-center justify-center group-data-[collapsible=icon]:size-4",
          { "bg-sidebar-primary rounded-lg": !server },
        )}
      >
        {isLoading ? (
          <Skeleton className="size-8 group-data-[collapsible=icon]:size-4" />
        ) : server ? (
          <Avatar>
            <AvatarImage src={server.icon ? getServerPictureUrl(server.id, server.icon) : undefined} />
            <AvatarFallback>{server.name?.substring(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
        ) : (
          <FontAwesomeIcon icon={faShield} className="size-4" />
        )}
      </div>

      <div className="group-data-[collapsible=icon]:hidden">
        {isLoading ? (
          <div className={cn("flex min-w-0 grow flex-col gap-1")}>
            <Skeleton className="bg-muted h-3 w-24" />
            <Skeleton className="bg-muted-foreground h-3 w-24" />
          </div>
        ) : (
          <div className={cn("flex min-w-0 grow flex-col whitespace-nowrap leading-tight")}>
            <span className="truncate font-semibold">{server?.name || "Unknown server"}</span>
            {badge && <div>{badge}</div>}
          </div>
        )}
      </div>

      {icon && <FontAwesomeIcon icon={icon} className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />}
    </div>
  );
}

export function UserInfo() {
  const { user, signOut, status } = useAuth();

  if (status === "loading" || !user)
    return (
      <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:hidden">
        <Skeleton className="size-8" />
        <Skeleton className="bg-muted h-3 w-24" />
      </div>
    );

  return (
    <>
      <div className="flex min-w-0 items-center gap-2 px-3 py-1 transition-all group-data-[collapsible=icon]:p-0">
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
