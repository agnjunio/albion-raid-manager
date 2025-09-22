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

export function getSettingsPageInfo(t: (key: string) => string): Record<string, SettingsPageInfo> {
  return {
    administration: {
      title: t("settings.pages.administration.title"),
      description: t("settings.pages.administration.description"),
      icon: faGears,
    },
    permissions: {
      title: t("settings.pages.permissions.title"),
      description: t("settings.pages.permissions.description"),
      icon: faShield,
    },
    raids: {
      title: t("settings.pages.raids.title"),
      description: t("settings.pages.raids.description"),
      icon: faShieldAlt,
    },
    registration: {
      title: t("settings.pages.registration.title"),
      description: t("settings.pages.registration.description"),
      icon: faUserPlus,
    },
    localization: {
      title: t("settings.pages.localization.title"),
      description: t("settings.pages.localization.description"),
      icon: faGlobe,
    },
  };
}
