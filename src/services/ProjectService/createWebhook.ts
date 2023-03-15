import GithubClient from "../GithubClient";
import { DeploymentError } from "../../utils/errors";

import ProjectService from "./";
import { createDeploymentDebug } from "../../utils/createDebug";
import Config from "../../config";

const createWebhook = async (service: ProjectService, next: Function) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const { githubAccessToken, repoOwner, repoName } = service;

  if (!repoOwner || !repoName) {
    debug("Error: Cannot find 'repoOwner' before creating EC2 instance.");

    throw new DeploymentError({
      code: "Projectservice_createWebhook",
      message: "createWebhook didn't work as expected",
    });
  }

  try {
    const githubClient = new GithubClient(githubAccessToken as string);
    const newWebhookData = await githubClient.createRepoWebhook(
      repoOwner,
      repoName,
    );
    const webhookId = newWebhookData.id.toString();

    service.webhookId = webhookId;
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during creating github repository webhook. - ${error}.`,
    );

    throw new DeploymentError({
      code: "Projectservice_createWebhook",
      message: "createWebhook didn't work as expected",
    });
  }

  next();
};

export default createWebhook;
