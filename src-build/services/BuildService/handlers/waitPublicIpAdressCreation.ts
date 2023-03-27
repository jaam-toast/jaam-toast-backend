import DBClient from "../../DBClient";
import InstanceClient from "../../InstanceClient";

import BuildService from "..";

const waitPublicIpAdreessCreation = async (
  service: BuildService,
  next: Function,
): Promise<void> => {
  const instanceClient = new InstanceClient();
  const { subdomain, deployedUrl, deploymentId, instanceId } = service;

  if (!subdomain || !deployedUrl || !deploymentId || !instanceId) {
    service.throw(
      "Cannot find environment data before waiting to check the EC2 instance created.",
    );
  }

  service.buildLog("Creating instance public IP...");

  try {
    const publicIpAddressInterval = setInterval(async () => {
      const instanceChangeInfo = await instanceClient.getState(instanceId);

      if (!instanceChangeInfo?.publicIpAddress) {
        return;
      }

      service.buildLog("Public IP creation has been completed.");

      service.publicIpAddress = instanceChangeInfo.publicIpAddress;

      clearInterval(publicIpAddressInterval);

      next();
    }, 2000);
  } catch (error) {
    service.throw(
      "An unexpected error occurred during waiting to check the EC2 instance created.",
      error,
    );
  }
};

export default waitPublicIpAdreessCreation;
