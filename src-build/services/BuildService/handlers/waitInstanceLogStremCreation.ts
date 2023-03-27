import Config from "../../../config";
import getLogStreamStatus from "../../deploy/build-utils/getLogStreamStatus";

import BuildService from "..";

const waitInstanceLogStremCreation = async (
  service: BuildService,
  next: Function,
): Promise<void> => {
  const { subdomain, instanceId, space, publicIpAddress } = service;

  if (!instanceId || !space || !publicIpAddress || !subdomain) {
    service.throw(
      "Cannot find environment data before waiting for checking EC2 instance Runtimelog status.",
    );
  }

  service.buildLog(
    `Requesting for a building log on ${subdomain}.${Config.SERVER_URL}...`,
  );

  try {
    let triesLeft = 50;

    const logStreamStatusInterval = setInterval(async () => {
      if (triesLeft <= 1) {
        clearInterval(logStreamStatusInterval);

        service.throw(
          "Checking the EC2 instance Runtimelog status was attempted more than 50 times but didn't work as expected.",
        );
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
    service.buildErrorLog(
      `An error has occurred during deployment and the deployment data is currently being deleted...`,
    );

    service.throw(
      "An unexpected error occurred during waiting for checking EC2 instance Runtimelog status.",
      error,
    );
  }
};

export default waitInstanceLogStremCreation;
