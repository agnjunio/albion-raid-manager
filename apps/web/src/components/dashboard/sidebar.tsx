"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Guild, GuildMember } from "@albion-raid-manager/database/models";
import {
  faCheck,
  faChevronDown,
  faFlag,
  faGear,
  faPeopleGroup,
  faShield,
  faShieldHalved,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "raids", label: "Raids", icon: faFlag },
  { href: "compositions", label: "Compositions", icon: faPeopleGroup },
  { href: "builds", label: "Builds", icon: faShieldHalved },
  { href: "members", label: "Members", icon: faUsers },
  { href: "settings", label: "Settings", icon: faGear },
];

interface DashboardSidebarProps {
  guilds: (Guild & {
    members: GuildMember[];
  })[];
}

export function DashboardSidebar({ guilds }: DashboardSidebarProps) {
  const [selectedGuild, setSelectedGuild] = useState<(typeof guilds)[number]>();

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <FontAwesomeIcon icon={faShield} className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{selectedGuild ? selectedGuild.name : "Select Guild"}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedGuild ? "Guild Selected" : "No Guild Selected"}
                </span>
              </div>
              <FontAwesomeIcon icon={faChevronDown} className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]" align="start">
            {guilds.map((guild) => (
              <DropdownMenuItem key={guild.id} onSelect={() => setSelectedGuild(guild)}>
                {guild.name}
                {guild === selectedGuild && <FontAwesomeIcon icon={faCheck} className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup hidden={!selectedGuild}>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {links.map((link) => (
              <SidebarMenuItem key={link.label}>
                <SidebarMenuButton asChild>
                  <Link href={`/dashboard/${link.href}`}>
                    <FontAwesomeIcon icon={link.icon} />
                    <span>{link.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
