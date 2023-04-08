import { registerEvent, publishEvent } from "./eventBus";

import type { DomainEvent } from "../domains/types/DomainEvent";
import type { Slice } from "./types/Slice";

export function createService({ slices }: { slices: Slice[] }) {
  slices.forEach(slice => {
    for (const handler in slice.handlers) {
      if (slice.handlers.hasOwnProperty(handler)) {
        registerEvent({
          name: handler as DomainEvent["name"],
          handler: slice.handlers[handler as DomainEvent["name"]],
        });
      }
    }
  });

  const dispatch = publishEvent;

  return {
    dispatch,
  };
}
