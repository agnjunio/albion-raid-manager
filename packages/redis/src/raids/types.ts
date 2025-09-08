import { Raid } from "@albion-raid-manager/types";

import { BaseEvent } from "../events";

// Raid-specific types
export interface RaidEvent extends BaseEvent<RaidEventData> {
  type: RaidEventType;
}

export enum RaidEventType {
  CREATED = "raid.created",
  UPDATED = "raid.updated",
  DELETED = "raid.deleted",
}

export interface RaidEventData {
  raid: Raid;
  previousRaid?: Partial<Raid>;
}

// Handler type for raid events
export type RaidEventHandler = (event: {
  event: BaseEvent<RaidEventData>;
  metadata: { source: "api" | "bot"; version: string };
}) => Promise<void> | void;

export function isRaidEvent(event: BaseEvent<RaidEventData>): event is RaidEvent {
  return (
    event.type === RaidEventType.CREATED || event.type === RaidEventType.UPDATED || event.type === RaidEventType.DELETED
  );
}
