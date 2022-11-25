import createError from "http-errors";

import createDeploymentInstance from "../../../deploy/build-utils/createDeploymentInstance";
import { bulidingLogSocket } from "../../../deploy/socket";
import { createRepoWebhook, getCommits } from "../../github/client";

import catchAsync from "../../../utils/asyncHandler";

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

  bulidingLogSocket();

  const { deployedUrl, instanceId } = await createDeploymentInstance(
    repoBuildOptions,
  );

  if (!deployedUrl || !instanceId) {
    return next(createError(401));
  }

  createRepoWebhook(githubAccessToken as string, repoOwner, repoName);

  req.deploymentData = {
    ...repoBuildOptions,
    instanceId,
    deployedUrl,
    lastCommitMessage,
  };

  next();
});

export default deployInstance;
