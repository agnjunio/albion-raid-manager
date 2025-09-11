// Registration-specific types
export interface RegistrationEvent extends BaseEvent<RegistrationEventData> {
  type: RegistrationEventType;
}

export enum RegistrationEventType {
  CREATED = "registration.created",
  UPDATED = "registration.updated",
  VERIFIED = "registration.verified",
  DELETED = "registration.deleted",
}

export interface RegistrationEventData {
  registration: {
    id: string;
    userId: string;
    username: string;
    characterName: string;
    guildId?: string;
    status: "pending" | "verified" | "rejected";
  };
  previousStatus?: string;
  changes?: Record<string, unknown>;
}

// Re-export BaseEvent for convenience
export interface BaseEvent<T = Record<string, unknown>> {
  type: string;
  entityId: string;
  serverId: string;
  timestamp: string;
  data: T;
}

// Handler type for registration events
export type RegistrationEventHandler = (event: {
  event: BaseEvent<RegistrationEventData>;
  metadata: { source: "api" | "bot"; version: string };
}) => Promise<void> | void;
