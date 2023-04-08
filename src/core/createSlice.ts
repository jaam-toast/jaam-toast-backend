import type { DomainAggregate } from "../domains/types/DomainAggregate";
import type { BaseHandler } from "./types/BaseHandler";
import type { DomainEvent } from "../domains/types/DomainEvent";
import type { Slice } from "./types/Slice";

export function createSlice<AggregateName extends DomainAggregate["name"]>({
  handlers,
}: {
  handlers: Record<DomainEvent["name"], BaseHandler<AggregateName>>;
}): Slice {
  return {
    handlers,
  };
}
