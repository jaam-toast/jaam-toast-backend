import GithubClient from "@src/services/GithubClient";
import ProjectService from "@src/services/ProjectService";

const createWebhook = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const { githubAccessToken, space, repoName, webhookId } = service;

  if (webhookId) {
    return next();
  }

  if (!githubAccessToken || !space || !repoName) {
    service.throw("Cannot find environment data");
  }

  try {
    const githubClient = new GithubClient(githubAccessToken as string);

    const newWebhookData = await githubClient.createRepoWebhook(
      space,
      repoName,
    );
    const webhookId = newWebhookData.id;

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
