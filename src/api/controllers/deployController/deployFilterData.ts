import Config from "../../../config";

import catchAsync from "../../../utils/asyncHandler";
import { DeploymentError } from "../../../utils/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

const deployFilterData = catchAsync(async (req, res, next) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const { repoName, repoCloneUrl, repoOwner, deployedUrl, instanceId } =
    req.deploymentData;

  if (!repoName || !repoCloneUrl || !repoOwner || !deployedUrl || !instanceId) {
    debug(
      "Error: 'repoName', 'repoCloneUrl', 'repoOwner', and 'deployedUrl' are expected to be strings",
    );

    return next(
      new DeploymentError({
        code: "deployFilterData",
        message:
          "'repoName', 'repoCloneUrl', 'repoOwner', and 'deployedUrl' are typeof undefined",
      }),
    );
  }

  debug(`A new website successfully gets deployed!`);

  const {
    repoUpdatedAt,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    bulidType,
    buildingLog,
    lastCommitMessage,
  } = req.deploymentData;

  const userDeploymentData = {
    repoName,
    repoOwner,
    repoCloneUrl,
    repoUpdatedAt,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    bulidType,
    deployedUrl,
    buildingLog,
    lastCommitMessage,
  };

  debug(
    "Sending back to client of the newly created deployment buliding log...",
  );

  return res.json({
    result: "ok",
    data: userDeploymentData,
  });
});

export default deployFilterData;
