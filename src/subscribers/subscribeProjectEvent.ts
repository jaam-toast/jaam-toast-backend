import { nanoid } from "nanoid";

import { ProjectStatus } from "../@types/project";
import { container } from "../@config/di.config";
import { subscribeEvent } from "../@utils/emitEvent";
import { NotFoundError } from "../@utils/defineErrors";
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
            path: {
              type: "string",
              description: "text",
            },
            size: {
              type: "number",
            },
          },
        },
      },
    ];

    await projectRepository.createDocument({
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
        customDomain: [],
        deploymentData: {},
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
  }) => {
    const updatedAt = new Date().toISOString();
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      throw new NotFoundError(
        "An error occurred while executing the event. Cannot find Project data.",
      );
    }

    const newEnvList = envList ? project.envList.concat(envList) : null;

    await projectRepository.updateDocument({
      documentId: projectName,
      document: {
        status: ProjectStatus.Pending,
        projectUpdatedAt: updatedAt,
        ...(repoCloneUrl && { repoCloneUrl }),
        ...(installCommand && { installCommand }),
        ...(buildCommand && { buildCommand }),
        ...(newEnvList && { envList: newEnvList }),
      },
    });
  },
);

subscribeEvent(
  "ADD_PROJECT_OPTIONS",
  async ({ projectName, customDomain, webhook }) => {
    const updatedAt = new Date().toISOString();
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      throw new NotFoundError(
        "An error occurred while executing the event. Cannot find Project data.",
      );
    }

    const newCustomDomain = !!customDomain
      ? project.customDomain?.concat(customDomain) ?? [customDomain]
      : null;
    const newWebhookList = (() => {
      if (!webhook) {
        return null;
      }

      if (!webhook.webhookId) {
        return project.webhookList.concat({
          ...webhook,
          webhookId: nanoid(),
        });
      }

      const updatedWebhook = project.webhookList.find(
        projectWebhook => projectWebhook.webhookId === webhook.webhookId,
      );

      if (!updatedWebhook) {
        throw new NotFoundError(
          "An error occurred while executing the event. Cannot find Project webhook data.",
        );
      }

      const newWebhookEventsSet = new Set(updatedWebhook.events);

      for (const event of webhook.events) {
        newWebhookEventsSet.add(event);
      }

      const newWebhookEvents = Array.from(newWebhookEventsSet);
      const newWebhook = {
        ...updatedWebhook,
        ...webhook,
        events: newWebhookEvents,
      };

      return project.webhookList.map(projectWebhook =>
        projectWebhook.webhookId !== webhook.webhookId
          ? projectWebhook
          : newWebhook,
      );
    })();

    await projectRepository.updateDocument({
      documentId: projectName,
      document: {
        projectUpdatedAt: updatedAt,
        ...(newCustomDomain && { customDomain: newCustomDomain }),
        ...(newWebhookList && { webhookList: newWebhookList }),
      },
    });
  },
);

subscribeEvent(
  "REMOVE_PROJECT_OPTIONS",
  async ({ projectName, customDomain, webhookIds }) => {
    const updatedAt = new Date().toISOString();
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      throw new NotFoundError(
        "An error occurred while executing the event. Cannot find Project data.",
      );
    }

    const newCustomDomain = !!customDomain
      ? project.customDomain?.filter(domain => domain !== customDomain) ?? []
      : null;
    const newWebhookList = !!webhookIds
      ? project.webhookList.filter(
          ({ webhookId }) => !!webhookIds.includes(webhookId),
        )
      : null;

    await projectRepository.updateDocument({
      documentId: projectName,
      document: {
        projectUpdatedAt: updatedAt,
        ...(newCustomDomain && { customDomain: newCustomDomain }),
        ...(newWebhookList && { webhookList: newWebhookList }),
      },
    });
  },
);

subscribeEvent("DEPLOYMENT_ERROR", async ({ projectName, error }) => {
  await projectRepository.deleteDocument({
    documentId: projectName,
  });

  log.serverError(error.message, error.stack ?? "-", error.name);
});

subscribeEvent(
  "DEPLOYMENT_UPDATED",
  async ({
    projectName,
    originalBuildDomain,
    deploymentData,
    jaamToastDomain,
  }) => {
    const updatedAt = new Date().toISOString();
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      throw new NotFoundError(
        "An error occurred while executing the event. Cannot find Project data.",
      );
    }

    await projectRepository.updateDocument({
      documentId: projectName,
      document: {
        status: ProjectStatus.Ready,
        projectUpdatedAt: updatedAt,
        ...(originalBuildDomain && { originalBuildDomain }),
        ...(deploymentData && { deploymentData }),
        ...(jaamToastDomain && { jaamToastDomain }),
      },
    });
  },
);

subscribeEvent(
  "SCHEMA_CREATED",
  async ({ projectName, schemaName, schema }) => {
    const [project] = await projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      throw new NotFoundError(
        "An error occurred while executing the event. Cannot find Project data.",
      );
    }

    const newSchemaList = project.schemaList.concat({ schema, schemaName });

    await projectRepository.updateDocument({
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
    throw new NotFoundError(
      "An error occurred while executing the event. Cannot find Project data.",
    );
  }

  const newSchemaList = project.schemaList.filter(
    projectSchema => projectSchema.schemaName !== schemaName,
  );

  await projectRepository.updateDocument({
    documentId: projectName,
    document: {
      schemaList: newSchemaList,
    },
  });
});
