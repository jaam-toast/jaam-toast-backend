import Event from "@src/models/Event";

import { LeanDocument } from "mongoose";
import { BaseEvent } from "./types/BaseEvent";

type Callback = (options: BaseEvent<string, {}>) => void;
type RollBackOption = Omit<BaseEvent<string, {}>, "name"> & { version: number };

export type EventStore = {
  subscribers: Callback[];
  getAllEvents(
    arg: Pick<BaseEvent<string, {}>, "aggregateId">,
  ): Promise<LeanDocument<Event>[] | LeanDocument<Event>[]>;
  getLastEvent(
    arg: Pick<BaseEvent<string, {}>, "aggregateId">,
  ): Promise<LeanDocument<Event>[] | LeanDocument<Event>[]>;
  appendToStream(arg: BaseEvent<string, {}>): Promise<void>;
  rollBack(options: RollBackOption): Promise<void>;
  publish(options: BaseEvent<string, {}>): void;
  subscribe(callback: Callback): void;
  unSubscribe(callback: Callback): void;
};

/**
 *  How to use
 *  1. const eventStore = EventStore();
 *  2. eventStore.publish({ ... })
 *  3. await getAllEvents({ aggregateId })
 *  4. await rollBack({ ... })
 */

// TODO data type 추가

export function EventStore() {
  const subscribers: EventStore["subscribers"] = [];

  const getAllEvents: EventStore["getAllEvents"] = async ({ aggregateId }) => {
    try {
      const events = await Event.find({ aggregateId }).lean();

      return events;
    } catch (error) {
      throw Error("Fail to import all event streams.");
    }
  };

  const getLastEvent: EventStore["getLastEvent"] = async ({ aggregateId }) => {
    try {
      const event = await Event.findOne({
        aggregateId: aggregateId,
      })
        .sort({ createdAt: -1 })
        .limit(1);

      return event;
    } catch (error) {
      throw Error("Fail to import event stream.");
    }
  };

  const appendToStream: EventStore["appendToStream"] = async ({
    name,
    aggregateId,
    eventId,
    createdAt,
    data,
  }) => {
    try {
      await Event.create({
        name,
        aggregateId,
        eventId,
        createdAt,
        data,
      });
    } catch (error) {
      throw Error("Fail to add event stream.");
    }
  };

  const rollBack: EventStore["rollBack"] = async options => {
    try {
      await Event.deleteMany({ aggregateId: options.aggregateId })
        .sort({ createdAt: -1 })
        .limit(options.version);
    } catch (error) {
      throw Error("Failed to roll back event stream.");
    }
  };

  const publish: EventStore["publish"] = options => {
    if (!subscribers.length) {
      return;
    }

    subscribers.forEach(subscriber => {
      subscriber(options);
    });
    appendToStream(options);
  };

  const subscribe: EventStore["subscribe"] = callback => {
    subscribers.push(callback);
  };

  const unSubscribe: EventStore["unSubscribe"] = callback => {
    const subscriberIndex = subscribers.findIndex(
      subscriber => subscriber === callback,
    );

    if (subscriberIndex > -1) {
      subscribers.splice(subscriberIndex, 1);
    }
  };

  return {
    getAllEvents,
    getLastEvent,
    rollBack,
    publish,
    subscribe,
    unSubscribe,
  };
}
