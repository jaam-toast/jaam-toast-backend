import type { DomainEvent } from "../domains/types/DomainEvent";
import type { BaseHandler } from "./types/BaseHandler";
import type { BaseEvent } from "./types/BaseEvent";

const mapEventToHandler: Partial<Record<DomainEvent["name"], BaseHandler[]>> =
  {};

export function registerEvent({
  name,
  handler,
}: {
  name: DomainEvent["name"];
  handler: BaseHandler;
}): void {
  if (Array.isArray(mapEventToHandler[name])) {
    mapEventToHandler[name]?.push(handler);
    return;
  }

  mapEventToHandler[name] = [handler];
}

export function publishEvent<EventName extends DomainEvent["name"]>({
  name,
  ...data
}: {
  name: EventName;
  data: Omit<
    Extract<DomainEvent, { name: EventName }>,
    "name" | "eventId" | "createdAt"
  >;
}): void {
  const handlers = mapEventToHandler[name];

  if (!handlers || handlers.length === 0) {
    throw new Error("There are no registered handlers for this event.");
  }

  const event: BaseEvent<EventName, {}> = {
    name,
    eventId: "string",
    createdAt: "string",
    ...data,
  };
  // TODO: const aggregate = event.aggregateId ? findAggregate(aggregateId) : null;
  const aggregate = null;

  handlers.forEach(handler => {
    handler(event, aggregate, publishEvent);
  });
}
