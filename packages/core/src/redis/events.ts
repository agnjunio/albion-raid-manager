// Generic event interfaces
export interface BaseEvent<T = Record<string, unknown>> {
  type: string;
  entityId: string;
  serverId: string;
  timestamp: string;
  data: T;
}

export interface RedisEventMessage<T = Record<string, unknown>> {
  event: BaseEvent<T>;
  metadata: {
    source: "api" | "bot" | null;
    version: string;
  };
}
