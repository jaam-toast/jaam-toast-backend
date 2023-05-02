export type BaseEvent<Name extends string, Data> = {
  name: Name;
} & Data;
