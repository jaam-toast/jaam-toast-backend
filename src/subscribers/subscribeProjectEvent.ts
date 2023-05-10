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
    status,
  }) => {
    const createdAt = new Date().toISOString();
    const initialSchemaList = [
      {
        schemaName: "assets",
        schema: {
          title: "assets",
          type: "object" as const,
          properties: {
            url: {
              type: "string",
              format: "url",
            },
            name: {
              type: "string",
            },
            size: {
              type: "number",
            },
          },
        },
      },
    ];

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
        status,
        webhookList: [],
        schemaList: initialSchemaList,
      },
    });
  },
);

subscribeEvent(
  "UPDATE_PROJECT",
  async ({
    projectName,
    repoCloneUrl,
    installCommand,
    buildCommand,
    envList,
    buildDomain,
  }) => {
    const updatedAt = new Date().toISOString();
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      return;
    }

    const newEnvList = envList ? project.envList.concat(envList) : null;
    const newBuildDomain = buildDomain
      ? (project.buildDomain ?? []).concat(buildDomain)
      : null;

    projectRepository.updateDocument({
      documentId: projectName,
      document: {
        status: ProjectStatus.Pending,
        projectUpdatedAt: updatedAt,
        ...(repoCloneUrl && { repoCloneUrl }),
        ...(installCommand && { installCommand }),
        ...(buildCommand && { buildCommand }),
        ...(newEnvList && { envList: newEnvList }),
        ...(newBuildDomain && { buildDomain: newBuildDomain }),
      },
    });
  },
);

subscribeEvent("DELETE_PROJECT", ({ projectName }) => {
  projectRepository.deleteDocument({
    documentId: projectName,
  });
});

subscribeEvent(
  "ADD_PROJECT_OPTIONS",
  async ({ projectName, buildDomain, webhook }) => {
    const updatedAt = new Date().toISOString();
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      return;
    }

    const newBuildDomain = !!buildDomain
      ? project.buildDomain?.concat(buildDomain) ?? [buildDomain]
      : null;
    const newWebhookList = !!webhook
      ? project.webhookList.concat(webhook)
      : null;

    projectRepository.updateDocument({
      documentId: projectName,
      document: {
        projectUpdatedAt: updatedAt,
        ...(newBuildDomain && { buildDomain: newBuildDomain }),
        ...(newWebhookList && { webhookList: newWebhookList }),
      },
    });
  },
);

subscribeEvent(
  "REMOVE_PROJECT_OPTIONS",
  async ({ projectName, buildDomain, webhook }) => {
    const updatedAt = new Date().toISOString();
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      return;
    }

    const newBuildDomain = !!buildDomain
      ? project.buildDomain?.filter(domain => domain !== buildDomain) ?? []
      : null;
    const newWebhookList = !!webhook
      ? project.webhookList.filter(
          ({ url, name }) => url === webhook.url && name === webhook.name,
        )
      : null;

    projectRepository.updateDocument({
      documentId: projectName,
      document: {
        projectUpdatedAt: updatedAt,
        ...(newBuildDomain && { buildDomain: newBuildDomain }),
        ...(newWebhookList && { webhookList: newWebhookList }),
      },
    });
  },
);

subscribeEvent("DEPLOYMENT_ERROR", ({ projectName, message }) => {
  const updatedAt = new Date().toISOString();

  projectRepository.updateDocument({
    documentId: projectName,
    document: {
      status: ProjectStatus.Fail,
      projectUpdatedAt: updatedAt,
    },
  });

  log.serverError(message);
});

subscribeEvent(
  "SCHEMA_CREATED",
  async ({ projectName, schemaName, schema }) => {
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      return;
    }

    const newSchemaList = project.schemaList.concat({ schema, schemaName });

    projectRepository.updateDocument({
      documentId: projectName,
      document: {
        schemaList: newSchemaList,
      },
    });
  },
);

subscribeEvent(
  "SCHEMA_UPDATED",
  async ({ projectName, schemaName, schema }) => {
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      return;
    }

    const newSchemaList = project.schemaList.map(projectSchema =>
      projectSchema.schemaName === schemaName
        ? { schemaName, schema }
        : projectSchema,
    );

    projectRepository.updateDocument({
      documentId: projectName,
      document: {
        schemaList: newSchemaList,
      },
    });
  },
);

subscribeEvent("SCHEMA_DELETED", async ({ projectName, schemaName }) => {
  const [project] = await projectRepository.readDocument({
    documentId: projectName,
  });

  if (!project) {
    return;
  }

  const newSchemaList = project.schemaList.filter(
    projectSchema => projectSchema.schemaName !== schemaName,
  );

  projectRepository.updateDocument({
    documentId: projectName,
    document: {
      schemaList: newSchemaList,
    },
  });
});
