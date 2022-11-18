import createError from "http-errors";

import catchAsync from "../../utils/asyncHandler";

import createDeployment from "../../deploy/build-utils/createDeployment";
import { bulidingLogSocket } from "../../deploy/socket";
import { createRepoWebhook } from "../github/client";

export const deployUserRepo = catchAsync(async (req, res, next) => {
  const { githubAccessToken } = req.query;

  if (!githubAccessToken) {
    return next(createError(400));
  }

  const {
    repoName,
    repoCloneUrl,
    nodeVersion,
    envList,
    installCommand,
    buildCommand,
  } = req.body;

  if (!repoName || !repoCloneUrl) {
    return next(createError(400));
  }

  const repoBuildOptions = {
    repoName,
    remoteUrl: repoCloneUrl,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
  };
  const repoOwner = repoCloneUrl.split("https://github.com/")[1].split("/")[0];

  const newDeploymentInfo = await createDeployment(repoBuildOptions);

  bulidingLogSocket();

  createRepoWebhook(githubAccessToken as string, repoOwner, repoName);

  return res.json({
    result: "ok",
    data: newDeploymentInfo,
  });
});
