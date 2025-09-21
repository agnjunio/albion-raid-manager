import { faGlobe, faInfoCircle, faShield, faShieldAlt, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, useParams } from "react-router-dom";

import { cn } from "@/lib/utils";

const settingsNavigation = [
  { name: "Administration", href: "administration", icon: faInfoCircle },
  { name: "Permissions", href: "permissions", icon: faShield },
  { name: "Raids", href: "raids", icon: faShieldAlt },
  { name: "Registration", href: "registration", icon: faUserPlus },
  { name: "Localization", href: "localization", icon: faGlobe },
];

export function SettingsSidebar() {
  const { serverId } = useParams<{ serverId: string }>();

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden h-full flex-col lg:flex">
        {/* Settings Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <h3 className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-wider">Configuration</h3>
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
                      {item.name === "Administration" && (
                        <span className="text-xs opacity-70">Server info & audit</span>
                      )}
                      {item.name === "Permissions" && <span className="text-xs opacity-70">Role-based access</span>}
                      {item.name === "Raids" && <span className="text-xs opacity-70">Raid configuration</span>}
                      {item.name === "Registration" && <span className="text-xs opacity-70">User registration</span>}
                      {item.name === "Localization" && <span className="text-xs opacity-70">Language settings</span>}
                    </div>
                    {item.name === "Raids" && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                        !
                      </div>
                    )}
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
            className="flex items-center gap-3 rounded-lg border border-blue-200/50 bg-blue-50 p-3 transition-all duration-200 hover:bg-blue-100 dark:border-blue-800/50 dark:bg-blue-900/20 dark:hover:bg-blue-900/30"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Need help?</span>
              <p className="text-xs text-blue-600 dark:text-blue-400">Join our Discord community</p>
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
                    {item.name === "Raids" && (
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
