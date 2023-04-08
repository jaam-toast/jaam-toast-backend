import type { DomainAggregate } from "@src/domains/types/DomainAggregate";
import type { DomainEvent } from "../../domains/types/DomainEvent";

export type BaseHandler<
  AggregateName extends DomainAggregate["name"] = DomainAggregate["name"],
  Event extends DomainEvent = DomainEvent,
> = (
  event: Event,
  aggregate: Extract<DomainAggregate, { name: AggregateName }> | null,
  publish: <PublishEventName extends DomainEvent["name"]>({
    name,
    data,
  }: {
    name: PublishEventName;
    data: Omit<
      Extract<DomainEvent, { name: PublishEventName }>,
      "name" | "eventId" | "createdAt"
    >;
  }) => void,
) => void;
