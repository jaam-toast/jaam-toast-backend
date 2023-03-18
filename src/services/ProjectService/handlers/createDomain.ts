import Config from "@src/config";
import log from "@src/services/Logger";
import DomainClient from "@src/services/DomainClient";

import ProjectService from "@src/services/ProjectService";

const createDomain = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const { subdomain, repoOwner, instanceId, webhookId, publicIpAddress } =
    service;

  if (!repoOwner || !instanceId || !webhookId || !publicIpAddress) {
    service.throw("Cannot find environment data before creating DNS Record.");
  }

  try {
    const domainClient = new DomainClient();
    const recordChangeInfo = await domainClient.createARecord(
      `${subdomain}.${Config.SERVER_URL}`,
      publicIpAddress,
    );

    if (!recordChangeInfo?.recordId) {
      service.throw("Cannot find record id after creating DNS Record.");
    }

    log.build(
      `A new A record '${recordChangeInfo.recordId}' for ${publicIpAddress} has been requested: [${recordChangeInfo.recordStatus}] - at ${recordChangeInfo.recordCreatedAt}`,
    );

    service.recordId = recordChangeInfo.recordId;
  } catch (error) {
    log.buildError(
      `An error has occurred during deployment and the deployment data is currently being deleted...`,
    );

    service.deleteDeployment();

    service.throw(
      "An unexpected error occurred during creating DNS Record.",
      error,
    );
  }

  next();
};

export default createDomain;
