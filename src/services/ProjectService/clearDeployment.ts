import ProjectService from ".";

import Config from "../../config";
import { createDeploymentDebug } from "../../utils/createDebug";
import DomainClient from "../DomainClient";
import InstanceClient from "../InstanceClient";

const clearDeployment = async (service: ProjectService, next: Function) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const { instanceId, subdomain, publicIpAddress } = service;

  try {
    debug("Start project clearly.");

    /* delete instance */
    if (instanceId) {
      const instanceClient = new InstanceClient();
      await instanceClient.remove(instanceId);

      debug(`Successfully terminated an instance (${instanceId}).`);
    }
    /* delete Domain Record */
    if (publicIpAddress) {
      const domainClient = new DomainClient();

      await domainClient.removeARecord(
        `${subdomain}.${Config.SERVER_URL}`,
        publicIpAddress,
      );

      debug(`Successfully terminated A record.`);
    }

    debug("Successfully clear the project data.");
  } catch (err) {
    throw new Error(
      "Error: An unexpected error occurred during the clearing project.",
    );
  }
};

export default clearDeployment;
