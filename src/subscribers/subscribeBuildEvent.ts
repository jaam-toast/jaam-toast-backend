import { container } from "../@config/di.config";
import { subscribeEvent } from "../@utils/emitEvent";
import { NotFoundError } from "../@utils/defineErrors";

import type { BuildService } from "../domains/BuildService";
import type { Repository } from "../@config/di.config";
import type { Project } from "../@types/project";

const buildService = container.get<BuildService>("BuildService");
const projectRepository =
  container.get<Repository<Project>>("ProjectRepository");

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
    buildService.createBuild({
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

subscribeEvent("UPDATE_PROJECT", async ({ isRedeployUpdate, ...payload }) => {
  if (!isRedeployUpdate) {
    return;
  }

  const [project] = await projectRepository.readDocument({
    documentId: payload.projectName,
  });

  if (!project) {
    throw new NotFoundError(
      "An error occurred while executing the event. Cannot find Project data.",
    );
  }

  const newEnvList = payload.envList
    ? project.envList.concat(payload.envList)
    : null;

  await buildService.createBuild({
    projectName: payload.projectName,
    repoName: project.repoName,
    framework: project.framework,
    repoCloneUrl: payload.repoCloneUrl ?? project.repoCloneUrl,
    installCommand: payload.installCommand ?? project.installCommand,
    buildCommand: payload.buildCommand ?? project.buildCommand,
    envList: newEnvList ?? project.envList,
  });
});

subscribeEvent("DELETE_PROJECT", async ({ projectName }) => {
  await buildService.deleteBuild({ projectName });
});
