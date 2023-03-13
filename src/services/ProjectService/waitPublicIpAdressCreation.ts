import Config from "../../config";
import describeInstanceIp from "../../services/deploy/aws/ec2_describeinstances";
import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import ProjectService from ".";

const waitPublicIpAdreessCreation = async (
  service: ProjectService,
  next: Function,
) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const { instanceId } = service;

  if (!instanceId) {
    debug(
      "Error: Cannot find environment data before waiting to check the EC2 instance created.",
    );

    throw new DeploymentError({
      code: "Projectservice_waitPublicIpAdreessCreation",
      message: "waitPublicIpAdreessCreation didn't work as expected",
    });
  }

  debug("Creating instance public IP...");

  try {
    const publicIpAddressInterval = setInterval(async () => {
      const instanceChangeInfo = await describeInstanceIp(instanceId);

      if (!instanceChangeInfo?.publicIpAddress) {
        return;
      }

      debug(
        `Created instance public IP: ${instanceChangeInfo.publicIpAddress}`,
      );

      service.publicIpAddress = instanceChangeInfo.publicIpAddress;

      clearInterval(publicIpAddressInterval);
      next();
    }, 2000);
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during waiting to check the EC2 instance created. - ${error}.`,
    );

    throw new DeploymentError({
      code: "Projectservice_waitPublicIpAdreessCreation",
      message: "waitPublicIpAdreessCreation didn't work as expected",
    });
  }
};

export default waitPublicIpAdreessCreation;
