import type { BaseEvent } from "@src/core/types/BaseEvent";

// TODO: remove this type.
type TempEvent = BaseEvent<"TempEvent", { tempData: string }>;

export type DomainEvent = TempEvent;
