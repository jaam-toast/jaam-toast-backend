import { BaseError } from "../@types/baseError";
import * as log from "./log";

import type { Events } from "./defineEvents";

type EventPayload<EventName extends Events["name"]> = Omit<
  Extract<Events, { name: EventName }>,
  "name"
>;

type SubscribeCallback<EventName extends Events["name"]> = (
  payload: EventPayload<EventName>,
  unsubscribe: () => void,
) => void | Promise<void>;

const subscribers: {
  [key in Events["name"]]?: SubscribeCallback<key>[];
} = {};

export function subscribeEvent<EventName extends Events["name"]>(
  eventName: EventName,
  callback: SubscribeCallback<EventName>,
) {
  const listeners = subscribers[eventName];

  if (Array.isArray(listeners)) {
    return listeners.push(callback);
  }

  subscribers[eventName] = [callback] as Extract<
    SubscribeCallback<Events["name"]>,
    { name: typeof eventName }
  >[];
}

function unsubscribeEvent({
  eventName,
  callbackIndex,
}: {
  eventName: Events["name"];
  callbackIndex: number;
}) {
  const listeners = subscribers[eventName];

  if (!listeners) {
    return;
  }

  listeners.splice(callbackIndex, 1);
}

export async function emitEvent<EventName extends Events["name"]>(
  eventName: EventName,
  payload: EventPayload<EventName>,
) {
  const listeners = subscribers[eventName];

  if (!listeners) {
    return;
  }

  for (const [index, listener] of listeners.entries()) {
    try {
      const unsubscribe = () =>
        unsubscribeEvent({ eventName, callbackIndex: index });
      await listener(payload, unsubscribe);
    } catch (error) {
      if (error instanceof BaseError) {
        log.serverError(
          error.name,
          error.message,
          error?.cause ?? "",
          error?.stack ?? "",
        );
      }
    }
  }
}
