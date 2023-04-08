import { BaseAggregate } from "../../core/types/BaseAggregate";

export type ProjectAggregate = BaseAggregate<
  "ProjectAggregate",
  { projectName: string }
>;

export type DomainAggregate = ProjectAggregate;
