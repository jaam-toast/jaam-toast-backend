import Config from "@src/config";
import log from "@src/services/Logger";
import DomainClient from "@src/services/DomainClient";
import InstanceClient from "@src/services/InstanceClient";

import ProjectService from "@src/services/ProjectService";

const clearDeployment = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const { instanceId, subdomain, publicIpAddress } = service;

  try {
    log.build("Start project clearly.");

    /* delete instance */
    if (instanceId) {
      const instanceClient = new InstanceClient();
      await instanceClient.remove(instanceId);

      log.build(`Successfully terminated an instance.`);
    }
    /* delete Domain Record */
    if (publicIpAddress) {
      const domainClient = new DomainClient();

      await domainClient.removeARecord(
        `${subdomain}.${Config.SERVER_URL}`,
        publicIpAddress,
      );

      log.build(`Successfully terminated Domain Record.`);
    }

    log.build("Successfully clear the project data.");
  } catch (error) {
    service.throw(
      "An unexpected error occurred during the clearing project.",
      error,
    );
  }
};

export default clearDeployment;
