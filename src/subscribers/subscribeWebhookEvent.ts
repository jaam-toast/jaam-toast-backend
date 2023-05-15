import axios from "axios";

import { container } from "../@config/di.config";
import { subscribeEvent } from "../@utils/emitEvent";
import { NotFoundError } from "../@utils/defineErrors";

import type { Project } from "../@types/project";
import type { Repository } from "../@config/di.config";

const projectRepository =
  container.get<Repository<Project>>("ProjectRepository");

subscribeEvent("DEPLOYMENT_UPDATED", async ({ projectName }) => {
  const [project] = await projectRepository.readDocument({
    documentId: projectName,
  });

  if (!project) {
    throw new NotFoundError(
      "An error occurred while executing the event. Cannot find Project data.",
    );
  }

  const eventWebhook = project.webhookList.filter(({ events }) =>
    events.includes("DEPLOYMENT_UPDATED"),
  );

  for await (const webhook of eventWebhook) {
    try {
      await axios.post(webhook.url, {
        event: "DEPLOYMENT_UPDATED",
        project,
      });
    } catch {}
  }
});

subscribeEvent("CONTENT_CREATED", async ({ projectName, schema, content }) => {
  const [project] = await projectRepository.readDocument({
    documentId: projectName,
  });

  if (!project) {
    throw new NotFoundError(
      "An error occurred while executing the event. Cannot find Project data.",
    );
  }

  project.webhookList.filter(({ events }) =>
    events.includes("CONTENT_CREATED"),
  );

  const eventWebhook = project.webhookList.filter(({ events }) =>
    events.includes("CONTENT_CREATED"),
  );

  for await (const webhook of eventWebhook) {
    try {
      await axios.post(webhook.url, {
        event: "CONTENT_CREATED",
        schema,
        content,
      });
    } catch {}
  }
});

subscribeEvent("CONTENT_UPDATED", async ({ projectName, schema, content }) => {
  const [project] = await projectRepository.readDocument({
    documentId: projectName,
  });

  if (!project) {
    throw new NotFoundError(
      "An error occurred while executing the event. Cannot find Project data.",
    );
  }

  const eventWebhook = project.webhookList.filter(({ events }) =>
    events.includes("CONTENT_UPDATED"),
  );

  for await (const webhook of eventWebhook) {
    try {
      await axios.post(webhook.url, {
        event: "CONTENT_UPDATED",
        schema,
        content,
      });
    } catch {}
  }
});

subscribeEvent("CONTENT_DELETED", async ({ projectName, schema }) => {
  const [project] = await projectRepository.readDocument({
    documentId: projectName,
  });

  if (!project) {
    throw new NotFoundError(
      "An error occurred while executing the event. Cannot find Project data.",
    );
  }

  const eventWebhook = project.webhookList.filter(({ events }) =>
    events.includes("CONTENT_UPDATED"),
  );

  for await (const webhook of eventWebhook) {
    try {
      await axios.post(webhook.url, {
        event: "CONTENT_DELETED",
        schema,
      });
    } catch {}
  }
});
