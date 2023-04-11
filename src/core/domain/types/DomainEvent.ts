import type { BaseEvent } from "@src/__temp/types/BaseEvent";

// TODO: remove this type.
type TempEvent = BaseEvent<"TempEvent", { tempData: string }>;

export type DomainEvent = TempEvent;
