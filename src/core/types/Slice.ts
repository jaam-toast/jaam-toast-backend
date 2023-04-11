import type { DomainEvent } from "../domain/types/DomainEvent";
import type { BaseHandler } from "./BaseHandler";

export type Slice = {
  handlers: Record<DomainEvent["name"], BaseHandler>;
};
