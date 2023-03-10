import Config from "../../config";

import runCertbot from "../../services/deploy/build-utils/runCertbot";

import catchAsync from "../../utils/asyncHandler";
import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";

const deployCertbot = catchAsync(async (req, res, next) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const { repoName, instanceId, recordId } = req.deploymentData;

  if (!repoName || !instanceId || !recordId) {
    debug(
      `Error: 'repoName', 'instanceId', and 'recordId' are expected to be strings`,
    );

    return next(
      new DeploymentError({
        code: "deployCertbot",
        message: "'repoName', 'instanceId', or 'recordId' are typeof undefined",
      }),
    );
  }

  debug(
    `Requesting for a certificate to enable HTTPS on ${repoName}.${Config.SERVER_URL}...`,
  );

  const runCertbotResponse = await runCertbot(
    instanceId as string,
    recordId as string,
    repoName,
    req.deploymentData,
  );

  debug(`Successfully requested for a certificate`);

  next();
});

export default deployCertbot;
