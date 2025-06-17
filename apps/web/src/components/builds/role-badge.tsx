import type { BuildRole } from "@albion-raid-manager/core/types";

export function RoleBadge({ role }: { role: BuildRole }) {
  const roleClassName: { [key in BuildRole]: string } = {
    TANK: "bg-role-tank/25",
    CALLER: "bg-role-caller/25",
    SUPPORT: "bg-role-support/25",
    HEALER: "bg-role-healer/25",
    RANGED_DPS: "bg-role-ranged/25",
    MELEE_DPS: "bg-role-melee/25",
    BATTLEMOUNT: "bg-role-battlemount/25",
  };

  return <div className={roleClassName[role]}>{role}</div>;
}
