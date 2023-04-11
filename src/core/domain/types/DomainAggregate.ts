import { BaseAggregate } from "../../../../package/jaamux/types/BaseAggregate";

export type ProjectAggregate = BaseAggregate<
  "ProjectAggregate",
  { projectName: string }
>;

export type DomainAggregate = ProjectAggregate;
