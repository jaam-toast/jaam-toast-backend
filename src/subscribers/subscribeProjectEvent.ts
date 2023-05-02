import { ProjectStatus } from "../@types/project";
import { container } from "../@config/di.config";
import { subscribeEvent } from "../@utils/emitEvent";
import * as log from "../@utils/log";

import type { Repository } from "../@config/di.config";
import type { Project } from "../@types/project";

const projectRepository =
  container.get<Repository<Project>>("ProjectRepository");

subscribeEvent(
  "CREATE_PROJECT",
  async ({
    space,
    repoName,
    repoCloneUrl,
    projectName,
    framework,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    storageKey,
    schemaList,
    status,
  }) => {
    const createdAt = new Date().toISOString();

    projectRepository.createDocument({
      document: {
        space,
        repoName,
        repoCloneUrl,
        projectName,
        projectUpdatedAt: createdAt,
        framework,
        nodeVersion,
        installCommand,
        buildCommand,
        envList,
        storageKey,
        schemaList,
        status,
      },
    });
  },
);

subscribeEvent("PROJECT_CREATION_ERROR", ({ projectName, message }) => {
  const updatedAt = new Date().toISOString();

  projectRepository.updateDocument({
    documentId: projectName,
    document: {
      status: ProjectStatus.fail,
      projectUpdatedAt: updatedAt,
    },
  });

  log.serverError(message);
});

subscribeEvent(
  "PROJECT_CREATED",
  ({ projectName, jaamToastDomain, originalBuildDomain }) => {
    const updatedAt = new Date().toISOString();

    projectRepository.updateDocument({
      documentId: projectName,
      document: {
        status: ProjectStatus.success,
        projectUpdatedAt: updatedAt,
        buildDomain: [jaamToastDomain, originalBuildDomain],
      },
    });
  },
);

subscribeEvent("SCHEMA_CREATED", ({ projectName, schemaList }) => {
  projectRepository.updateDocument({
    documentId: projectName,
    document: { schemaList },
  });
});

subscribeEvent("SCHEMA_UPDATED", ({ projectName, schemaList }) => {
  projectRepository.updateDocument({
    documentId: projectName,
    document: { schemaList },
  });
});

subscribeEvent("SCHEMA_DELETED", ({ projectName, schemaList }) => {
  projectRepository.updateDocument({
    documentId: projectName,
    document: { schemaList },
  });
});
