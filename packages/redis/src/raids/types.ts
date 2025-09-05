import { Raid } from "@albion-raid-manager/database";

import { BaseEvent } from "../events";

// Raid-specific types
export interface RaidEvent extends BaseEvent<RaidEventData> {
  type: RaidEventType;
}

export enum RaidEventType {
  CREATED = "raid.created",
  UPDATED = "raid.updated",
  STATUS_CHANGED = "raid.status_changed",
  DELETED = "raid.deleted",
}

export type RaidData = Partial<Raid> & { id: string };

export interface RaidEventData {
  raid: RaidData;
  previousStatus?: string;
  changes?: Record<string, unknown>;
}

// Handler type for raid events
export type RaidEventHandler = (event: {
  event: BaseEvent<RaidEventData>;
  metadata: { source: "api" | "bot"; version: string };
}) => Promise<void> | void;

export function isRaidEvent(event: BaseEvent<RaidEventData>): event is RaidEvent {
  return (
    event.type === RaidEventType.CREATED ||
    event.type === RaidEventType.UPDATED ||
    event.type === RaidEventType.STATUS_CHANGED ||
    event.type === RaidEventType.DELETED
  );
}
