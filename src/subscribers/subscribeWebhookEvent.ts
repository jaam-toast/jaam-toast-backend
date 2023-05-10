import axios from "axios";

import { container } from "../@config/di.config";
import { subscribeEvent } from "../@utils/emitEvent";

import type { Project } from "../@types/project";
import type { Repository } from "../@config/di.config";

const projectRepository =
  container.get<Repository<Project>>("ProjectRepository");

subscribeEvent("DEPLOYMENT_UPDATED", async ({ projectName, buildDomain }) => {
  const [project] = await projectRepository.readDocument({
    documentId: projectName,
  });

  if (!project) {
    return;
  }

  const updatedBuildDomain = Array.isArray(buildDomain)
    ? buildDomain
    : [buildDomain];

  return project.webhookList
    .filter(({ events }) => events.includes("DEPLOYMENT_UPDATED"))
    .forEach(({ url }) => {
      axios.post(url, {
        event: "DEPLOYMENT_UPDATED",
        project,
        buildDomain: updatedBuildDomain,
      });
    });
});

subscribeEvent("CONTENT_CREATED", async ({ projectName, schema, content }) => {
  const [project] = await projectRepository.readDocument({
    documentId: projectName,
  });

  if (!project) {
    return;
  }

  return project.webhookList
    .filter(({ events }) => events.includes("CONTENT_CREATED"))
    .forEach(({ url }) => {
      axios.post(url, {
        event: "CONTENT_CREATED",
        schema,
        content,
      });
    });
});

subscribeEvent("CONTENT_UPDATED", async ({ projectName, schema, content }) => {
  const [project] = await projectRepository.readDocument({
    documentId: projectName,
  });

  if (!project) {
    return;
  }

  return project.webhookList
    .filter(({ events }) => events.includes("CONTENT_UPDATED"))
    .forEach(({ url }) => {
      axios.post(url, {
        event: "CONTENT_UPDATED",
        schema,
        content,
      });
    });
});

subscribeEvent("CONTENT_DELETED", async ({ projectName, schema }) => {
  const [project] = await projectRepository.readDocument({
    documentId: projectName,
  });

  if (!project) {
    return;
  }

  return project.webhookList
    .filter(({ events }) => events.includes("CONTENT_DELETED"))
    .forEach(({ url }) => {
      axios.post(url, {
        event: "CONTENT_DELETED",
        schema,
      });
    });
});
