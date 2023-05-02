import { container } from "../@config/di.config";
import { subscribeEvent } from "../@utils/emitEvent";

import type { BuildService } from "../domains/BuildService";

const buildService = container.get<BuildService>("BuildService");

subscribeEvent(
  "CREATE_PROJECT",
  ({
    repoName,
    repoCloneUrl,
    projectName,
    framework,
    installCommand,
    buildCommand,
    envList,
  }) => {
    buildService.createDeployment({
      repoName,
      repoCloneUrl,
      projectName,
      framework,
      installCommand,
      buildCommand,
      envList,
    });
  },
);
