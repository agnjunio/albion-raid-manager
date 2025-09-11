import { BaseEvent, RedisEventMessage } from "./events";

export class RedisEventMessageBuilder<T = Record<string, unknown>> {
  private event: Partial<BaseEvent<T>> = {};
  private metadata: RedisEventMessage["metadata"] = {
    source: null,
    version: "1.0.0",
  };

  static create<T = Record<string, unknown>>(): RedisEventMessageBuilder<T> {
    return new RedisEventMessageBuilder<T>();
  }

  withEventType(type: string): RedisEventMessageBuilder<T> {
    this.event.type = type;
    return this;
  }

  withEntityId(entityId: string): RedisEventMessageBuilder<T> {
    this.event.entityId = entityId;
    return this;
  }

  withServerId(serverId: string): RedisEventMessageBuilder<T> {
    this.event.serverId = serverId;
    return this;
  }

  withTimestamp(timestamp?: string): RedisEventMessageBuilder<T> {
    this.event.timestamp = timestamp || new Date().toISOString();
    return this;
  }

  withData(data: T): RedisEventMessageBuilder<T> {
    this.event.data = data;
    return this;
  }

  withSource(source: RedisEventMessage["metadata"]["source"]): RedisEventMessageBuilder<T> {
    this.metadata.source = source;
    return this;
  }

  withVersion(version: string): RedisEventMessageBuilder<T> {
    this.metadata.version = version;
    return this;
  }

  build(): RedisEventMessage<T> {
    // Set timestamp if not already set
    if (!this.event.timestamp) {
      this.event.timestamp = new Date().toISOString();
    }

    if (!this.event.type || !this.event.entityId || !this.event.serverId || !this.event.timestamp || !this.event.data) {
      throw new Error("Missing required fields: type, entityId, serverId, timestamp, and data must be set");
    }

    return {
      event: this.event as BaseEvent<T>,
      metadata: this.metadata,
    };
  }
}
