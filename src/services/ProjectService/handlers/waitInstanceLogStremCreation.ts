import Config from "../../../config";
import getLogStreamStatus from "../../deploy/build-utils/getLogStreamStatus";
import { createDeploymentDebug } from "../../../utils/createDebug";
import { DeploymentError } from "../../../config/errors";

import ProjectService from "..";

const waitInstanceLogStremCreation = async (
  service: ProjectService,
  next: Function,
) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const { subdomain, instanceId, repoOwner, publicIpAddress } = service;

  if (!instanceId || !repoOwner || !publicIpAddress || !subdomain) {
    debug(
      "Error: Cannot find environment data before waiting for checking EC2 instance Runtimelog status.",
    );

    throw new DeploymentError({
      code: "Projectservice_waitInstanceLogStremCreation",
      message: "waitInstanceLogStremCreation didn't work as expected",
    });
  }

  debug(
    `Requesting for a building log on ${subdomain}.${Config.SERVER_URL}...`,
  );

  try {
    let triesLeft = 50;

    const logStreamStatusInterval = setInterval(async () => {
      if (triesLeft <= 1) {
        clearInterval(logStreamStatusInterval);

        debug(
          `Error: Checking the EC2 instance Runtimelog status was attempted more than 50 times but didn't work as expected.`,
        );

        throw new DeploymentError({
          code: "Projectservice_waitInstanceLogStremCreation",
          message: "waitInstanceLogStremCreation didn't work as expected",
        });
      }

      const logStremStatus = await getLogStreamStatus(instanceId, subdomain);
      const logStreamName = logStremStatus?.logStreamName;

      if (logStreamName !== instanceId) {
        triesLeft -= 1;
        return;
      }
      clearInterval(logStreamStatusInterval);

      next();
    }, 2000);
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during waiting for checking EC2 instance Runtimelog status. - ${error}.`,
    );

    service.deleteDeployment();

    throw new DeploymentError({
      code: "Projectservice_waitInstanceLogStremCreation",
      message: "waitInstanceLogStremCreation didn't work as expected",
    });
  }
};

export default waitInstanceLogStremCreation;
