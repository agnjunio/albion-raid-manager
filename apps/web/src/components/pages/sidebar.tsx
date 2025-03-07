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
import { faFlag, faGear, faPeopleGroup, faShieldHalved, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

const links = [
  { href: "raids", label: "Raids", icon: faFlag },
  { href: "compositions", label: "Compositions", icon: faPeopleGroup },
  { href: "builds", label: "Builds", icon: faShieldHalved },
  { href: "members", label: "Members", icon: faUsers },
  { href: "settings", label: "Settings", icon: faGear },
];

export function DashboardSidebar() {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
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
