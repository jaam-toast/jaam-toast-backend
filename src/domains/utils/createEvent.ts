import { nanoid } from "nanoid";

import type { DomainEvent } from "../types/DomainEvent";

export function createEvent<EventName extends DomainEvent["name"]>({
  name,
  data,
}: {
  name: EventName;
  data: Omit<
    Extract<DomainEvent, { name: EventName }>,
    "name" | "eventId" | "createdAt"
  >;
}): DomainEvent {
  const createdAt = new Date().toISOString();
  const eventId = nanoid();

  return {
    name,
    eventId,
    createdAt,
    ...data,
  };
}
