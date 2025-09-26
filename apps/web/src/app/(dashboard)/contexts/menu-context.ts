import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { useMemo } from "react";

import { faCog, faShield } from "@fortawesome/free-solid-svg-icons";

export interface MenuLink {
  name: string;
  href: string;
  icon: IconDefinition;
  submenu?: Omit<MenuLink, "icon" | "submenu">[];
}

export const useMenu = (hasAdminPermission: boolean): MenuLink[] => {
  const menuItems: MenuLink[] = useMemo(() => {
    const items = [{ name: "raids", href: "raids", icon: faShield }];

    if (hasAdminPermission) {
      items.push({ name: "settings", href: "settings", icon: faCog });
    }

    return items;
  }, [hasAdminPermission]);

  return menuItems;
};
