import { faGlobe, faInfoCircle, faShieldAlt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { NavLink, useParams } from "react-router-dom";

import { cn } from "@/lib/utils";

export function SettingsSidebar() {
  const { serverId } = useParams<{ serverId: string }>();
  const { t } = useTranslation();

  const settingsNavigation = [
    {
      name: t("settings.navigation.administration.name"),
      href: "administration",
      icon: faInfoCircle,
      description: t("settings.navigation.administration.description"),
    },
    {
      name: t("settings.navigation.raids.name"),
      href: "raids",
      icon: faShieldAlt,
      description: t("settings.navigation.raids.description"),
    },
    {
      name: t("settings.navigation.registration.name"),
      href: "registration",
      icon: faUserPlus,
      description: t("settings.navigation.registration.description"),
    },
    {
      name: t("settings.navigation.localization.name"),
      href: "localization",
      icon: faGlobe,
      description: t("settings.navigation.localization.description"),
    },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden h-full flex-col lg:flex">
        {/* Settings Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <h3 className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-wider">
              {t("settings.configuration")}
            </h3>
            {settingsNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={`/dashboard/${serverId}/settings/${item.href}`}
                className={({ isActive }) =>
                  cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200",
                        isActive ? "bg-primary-foreground/20" : "bg-muted/60 group-hover:bg-muted/80",
                      )}
                    >
                      <FontAwesomeIcon icon={item.icon} className="h-4 w-4 transition-all duration-200" />
                    </div>
                    <div className="flex flex-1 flex-col">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs opacity-70">{item.description}</span>
                    </div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Settings Help */}
        <div className="border-border/50 border-t p-4">
          <a
            href={import.meta.env.VITE_DISCORD_COMMUNITY_URL || "https://discord.gg/albion-raid-manager"}
            target="_blank"
            rel="noopener noreferrer"
            className="border-info-200/50 bg-info-500 hover:bg-info-100 flex items-center gap-3 rounded-lg border p-3 transition-all duration-200"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="text-info-foreground h-4 w-4" />
            <div>
              <span className="text-info-foreground text-sm font-medium">{t("settings.needHelp")}</span>
              <p className="text-info-foreground text-xs">{t("settings.joinDiscord")}</p>
            </div>
          </a>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="block lg:hidden">
        <nav className="overflow-x-auto p-4">
          <div className="flex gap-2">
            {settingsNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={`/dashboard/${serverId}/settings/${item.href}`}
                className={({ isActive }) =>
                  cn(
                    "group flex min-w-0 flex-shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-md transition-all duration-200",
                        isActive ? "bg-primary-foreground/20" : "bg-muted/60 group-hover:bg-muted/80",
                      )}
                    >
                      <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5 transition-all duration-200" />
                    </div>
                    <span className="whitespace-nowrap">{item.name}</span>
                    {item.href === "raids" && (
                      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                        !
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
}
