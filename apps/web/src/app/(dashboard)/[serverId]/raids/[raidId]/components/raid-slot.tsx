import type { RaidSlot } from "@albion-raid-manager/core/types";

import { cn } from "@albion-raid-manager/core/helpers/classNames";
import { getUserPictureUrl } from "@albion-raid-manager/discord/helpers";

interface Props {
  slot: RaidSlot;
}

export function RaidSlotCard({ slot }: Props) {
  return (
    <div
      key={slot.id}
      className={cn(
        "flex min-h-12 items-center justify-between rounded px-4 py-2",
        slot.role
          ? {
              TANK: "bg-role-tank/25",
              CALLER: "bg-role-caller/25",
              SUPPORT: "bg-role-support/25",
              HEALER: "bg-role-healer/25",
              RANGED_DPS: "bg-role-ranged/25",
              MELEE_DPS: "bg-role-melee/25",
              BATTLEMOUNT: "bg-role-battlemount/25",
            }[slot.role]
          : "bg-secondary-violet/25",
      )}
    >
      <div className="font-semibold">{slot.name}</div>
      <div>
        {slot.user ? (
          <div className="flex items-center gap-2">
            <div>{slot.user.username}</div>
            <picture>
              <img
                src={getUserPictureUrl(slot.user.id, slot.user.avatar)}
                className="size-8 select-none rounded-full"
                alt={slot.user.username}
              />
            </picture>
          </div>
        ) : (
          <div className="text-xs">Empty</div>
        )}
      </div>
    </div>
  );
}
