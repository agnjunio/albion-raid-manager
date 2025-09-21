import {
  faGears,
  faGlobe,
  faShield,
  faShieldAlt,
  faUserPlus,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

export interface SettingsPageInfo {
  title: string;
  description: string;
  icon: IconDefinition;
}

export const settingsPageInfo: Record<string, SettingsPageInfo> = {
  administration: {
    title: "Administration",
    description: "View server information and configure audit logging",
    icon: faGears,
  },
  permissions: {
    title: "Permissions",
    description: "Manage role-based access control and permissions",
    icon: faShield,
  },
  raids: {
    title: "Raid Settings",
    description: "Configure raid-related settings and preferences",
    icon: faShieldAlt,
  },
  registration: {
    title: "User Registration",
    description: "Set up user registration, role assignments, and audit logging",
    icon: faUserPlus,
  },
  localization: {
    title: "Localization",
    description: "Set language and regional preferences",
    icon: faGlobe,
  },
};
