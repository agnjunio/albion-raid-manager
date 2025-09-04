import { NavLink, useParams } from "react-router-dom";

import { cn } from "@albion-raid-manager/core/helpers";

const navigation = [
  { name: "Raids", href: "raids" },
  { name: "Settings", href: "settings" },
];

export function ServerSidebar() {
  const { serverId } = useParams();

  return (
    <div className="bg-muted/50 w-64 border-r p-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Server Management</h2>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={`/dashboard/${serverId}/${item.href}`}
              className={({ isActive }) =>
                cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
