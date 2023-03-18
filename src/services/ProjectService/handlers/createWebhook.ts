import GithubClient from "@src/services/GithubClient";

import ProjectService from "@src/services/ProjectService";

const createWebhook = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const { githubAccessToken, repoOwner, repoName } = service;

  if (!repoOwner || !repoName) {
    service.throw("Cannot find 'repoOwner' before creating EC2 instance.");
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
    service.throw(
      "An unexpected error occurred during creating github repository webhook.",
      error,
    );
  }

  next();
};

export default createWebhook;
