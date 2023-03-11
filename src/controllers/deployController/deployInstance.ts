import createError from "http-errors";

import createDeploymentInstance from "../../services/deploy/build-utils/createDeploymentInstance";
import { createRepoWebhook, getCommits } from "../../services/github/client";

import catchAsync from "../../utils/asyncHandler";

const deployInstance = catchAsync(async (req, res, next) => {
  const { githubAccessToken } = req.query;

  if (!githubAccessToken) {
    return next(createError(400));
  }

  const {
    repoName,
    repoCloneUrl,
    repoUpdatedAt,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    buildType,
  } = req.body;

  if (!repoName || !repoCloneUrl) {
    return next(createError(400));
  }

  const repoOwner = repoCloneUrl.split("https://github.com/")[1].split("/")[0];

  const commitList = await getCommits(
    githubAccessToken as string,
    repoOwner,
    repoName,
  );

  const lastCommitMessage = commitList[0].commit.message;

  const repoBuildOptions = {
    repoOwner,
    repoName,
    repoCloneUrl,
    repoUpdatedAt,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    buildType,
    lastCommitMessage,
  };

  const { deployedUrl, instanceId } = await createDeploymentInstance(
    repoBuildOptions,
  );

  if (!deployedUrl || !instanceId) {
    return next(createError(401));
  }

  const newWebhookData = await createRepoWebhook(
    githubAccessToken as string,
    repoOwner,
    repoName,
  );

  const webhookId = newWebhookData.id.toString();

  req.deploymentData = {
    ...repoBuildOptions,
    instanceId,
    deployedUrl,
    lastCommitMessage,
    webhookId,
  };

  next();
});

export default deployInstance;
