import Config from "../../config";
import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import ProjectService from ".";
import DomainClient from "../DomainClient";

const createDomain = async (service: ProjectService, next: Function) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const { subdomain, repoOwner, instanceId, webhookId, publicIpAddress } =
    service;

  if (!repoOwner || !instanceId || !webhookId || !publicIpAddress) {
    debug("Error: Cannot find environment data before creating DNS Record.");

    throw new DeploymentError({
      code: "Projectservice_createDomain",
      message: "createDomain didn't work as expected",
    });
  }

  try {
    const domainClient = new DomainClient();
    const recordChangeInfo = await domainClient.createARecord(
      `${subdomain}.${Config.SERVER_URL}`,
      publicIpAddress,
    );

    if (!recordChangeInfo?.recordId) {
      debug(`Error: Cannot find record id after creating DNS Record.`);

      throw new DeploymentError({
        code: "Projectservice_createWebhook",
        message: "createWebhook didn't work as expected",
      });
    }

    debug(
      `A new A record '${recordChangeInfo.recordId}' for ${publicIpAddress} has been requested: [${recordChangeInfo.recordStatus}] - at ${recordChangeInfo.recordCreatedAt}`,
    );

    service.recordId = recordChangeInfo.recordId;
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during creating DNS Record. - ${error}.`,
    );

    service.deleteDeployment();

    throw new DeploymentError({
      code: "Projectservice_createDomain",
      message: "createDomain didn't work as expected",
    });
  }

  next();
};

export default createDomain;
