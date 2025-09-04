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
    {
      href: "settings",
      label: "Settings",
      icon: faGear,
      submenu: [
        {
          href: "register",
          label: "Register",
        },
        {
          href: "raids",
          label: "Raids",
        },
      ],
    },
    { href: "raids", label: "Raids", icon: faFlag },
    { href: "compositions", label: "Compositions", icon: faPeopleGroup },
  ];
};
