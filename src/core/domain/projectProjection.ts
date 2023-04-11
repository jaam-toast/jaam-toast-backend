import Project from "@src/domains/repositories/models/Project";
import { BaseEvent } from "@src/__temp/types/BaseEvent";

export async function ProjectProjection(options: BaseEvent<string, {}>) {
  switch (options.name) {
    case "createdProject": {
      await Project.create(options);
    }
    case "createdRecord": {
      await Project.findByIdAndUpdate({
        id: options.aggregateId,
        data: options.data,
      });
    }
    case "deleteProject": {
      await Project.findByIdAndUpdate({
        id: options.aggregateId,
      });
    }
  }
}
