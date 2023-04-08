import type { BaseEvent } from "./BaseEvent";

export type BaseAggregate<Name extends string, State> = {
  name: Name;
  aggregateId: string;
  version: number;
  events: BaseEvent<string, {}>[];
} & State;
