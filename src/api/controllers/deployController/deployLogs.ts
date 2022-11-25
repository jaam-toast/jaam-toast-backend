import Config from "../../../config";

import runGetFilteredLogEvents from "../../../deploy/build-utils/runGetFilteredLogEvents";

import catchAsync from "../../../utils/asyncHandler";
import { DeploymentError } from "../../../utils/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

const deployLogs = catchAsync(async (req, res, next) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const { repoName, instanceId } = req.deploymentData;

  if (!repoName || !instanceId) {
    debug(`Error: 'repoName' and 'instanceId' are expected to be strings`);

    return next(
      new DeploymentError({
        code: "deployLogs",
        message: "'repoName' and 'instanceId' are typeof undefined",
      }),
    );
  }

  debug(`Requesting for a building log on ${repoName}.${Config.SERVER_URL}...`);

  const filteredLogEventMessages = await runGetFilteredLogEvents(
    instanceId as string,
    repoName,
    req.deploymentData,
  );

  req.deploymentData.buildingLog = filteredLogEventMessages;

  next();
});

export default deployLogs;
