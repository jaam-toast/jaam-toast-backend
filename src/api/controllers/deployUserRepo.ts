import createError from "http-errors";

import catchAsync from "../../utils/asyncHandler";

import { bulidingLogSocket } from "../../deploy/socket";
import createDeployment from "../../deploy/build-utils/createDeployment";

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

  const newDeploymentInfo = await createDeployment(repoBuildOptions);

  bulidingLogSocket();

  return res.json({
    result: "ok",
    data: newDeploymentInfo,
  });
});
