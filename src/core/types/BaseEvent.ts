export type BaseEvent<Name extends string, Data> = {
  name: Name;
  eventId: string;
  createdAt: string;
  // aggregateId: string;
} & Data;
