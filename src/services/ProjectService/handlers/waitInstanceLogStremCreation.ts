import Config from "@src/config";
import getLogStreamStatus from "@src/services/deploy/build-utils/getLogStreamStatus";
import log from "@src/services/Logger";

import ProjectService from "@src/services/ProjectService";

const waitInstanceLogStremCreation = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const { subdomain, instanceId, repoOwner, publicIpAddress } = service;

  if (!instanceId || !repoOwner || !publicIpAddress || !subdomain) {
    service.throw(
      "Cannot find environment data before waiting for checking EC2 instance Runtimelog status.",
    );
  }

  log.build(
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
    log.buildError(
      `An error has occurred during deployment and the deployment data is currently being deleted...`,
    );

    service.deleteDeployment();

    service.throw(
      "An unexpected error occurred during waiting for checking EC2 instance Runtimelog status.",
      error,
    );
  }
};

export default waitInstanceLogStremCreation;
