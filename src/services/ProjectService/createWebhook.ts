import ProjectService from "./";
import { createRepoWebhook } from "../GithubService/client";

const createWebhook = async (service: ProjectService, next: Function) => {
  const {
    githubAccessToken,
    repoOwner,
    repoName,
  } = service;

  if (
    !githubAccessToken
    || !repoName
    || !repoOwner
  ) {
    // to Be
    return service.throwError({ code: "123", message: "No github token found" });
  }

  try {
    const newWebhookData = await createRepoWebhook(
      githubAccessToken as string,
      repoOwner,
      repoName,
    );
    const webhookId = newWebhookData.id.toString();
    service.webhookId = webhookId;
  } catch (error) {
    // to Be
  }

  next();
};

export default createWebhook;
