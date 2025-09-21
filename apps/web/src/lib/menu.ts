import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { faCog, faShield } from "@fortawesome/free-solid-svg-icons";

export interface MenuLink {
  name: string;
  href: string;
  icon: IconDefinition;
  submenu?: Omit<MenuLink, "icon" | "submenu">[];
}

export const useMenu = (): MenuLink[] => {
  return [
    { name: "raids", href: "raids", icon: faShield },
    { name: "settings", href: "settings", icon: faCog },
  ];
};
