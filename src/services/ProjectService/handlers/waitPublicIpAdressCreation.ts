import InstanceClient from "@src/services/InstanceClient";
import log from "@src/services/Logger";

import ProjectService from "@src/services/ProjectService";

const waitPublicIpAdreessCreation = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const instanceClient = new InstanceClient();
  const { instanceId } = service;

  if (!instanceId) {
    service.throw(
      "Cannot find environment data before waiting to check the EC2 instance created.",
    );
  }

  log.build("Creating instance public IP...");

  try {
    const publicIpAddressInterval = setInterval(async () => {
      const instanceChangeInfo = await instanceClient.getState(instanceId);

      if (!instanceChangeInfo?.publicIpAddress) {
        return;
      }

      log.build("Public IP creation has been completed.");

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
