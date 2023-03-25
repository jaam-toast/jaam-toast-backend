import GithubClient from "@src/services/GithubClient";
import DB from "@src/services/DBService";
import ProjectService from "@src/services/ProjectService";

const checkWebhook = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const { githubAccessToken, space, repoName } = service;

  if (!githubAccessToken || !space || !repoName) {
    service.throw("Cannot find environment data");
  }

  try {
    const project = await DB.Project.findOne({ repoName });

    if (!project) {
      return next();
    }

    const githubClient = new GithubClient(githubAccessToken as string);
    const repoWebhook = await githubClient.getRepoWebhook(space, repoName);

    if (!repoWebhook.length) {
      return next();
    }

    if (repoWebhook.length > 1) {
      for await (const hook of repoWebhook) {
        if (await DB.Project.findOne({ webhookId: hook.id })) {
          service.webhookId = hook.id;

          break;
        }
      }
    } else {
      const repoWebhookId = repoWebhook[0].id;
      const project = await DB.Project.findOne({ webhookId: repoWebhookId });

      if (project) {
        service.webhookId = repoWebhookId;
      }
    }
  } catch (error) {
    service.throw(
      "An unexpected error occurred during creating github repository webhook.",
      error,
    );
  }

  next();
};

export default checkWebhook;
