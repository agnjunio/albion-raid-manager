import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faFlag, faGear, faPeopleGroup } from "@fortawesome/free-solid-svg-icons";

export interface MenuLink {
  href: string;
  label: string;
  icon?: IconDefinition;
  submenu?: Omit<MenuLink, "icon" | "submenu">[];
}

export const useMenu = (): MenuLink[] => {
  return [
    { href: "raids", label: "Raids", icon: faFlag },
    { href: "compositions", label: "Compositions", icon: faPeopleGroup },
    {
      href: "settings",
      label: "Settings",
      icon: faGear,
      submenu: [
        {
          href: "discord",
          label: "Discord",
        },
        {
          href: "raids",
          label: "Raids",
        },
      ],
    },
  ];
};
