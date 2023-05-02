import { container } from "src/@config/di.config";
import { subscribeEvent } from "src/@utils/emitEvent";

import type { BuildService } from "src/domains/BuildService";

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
