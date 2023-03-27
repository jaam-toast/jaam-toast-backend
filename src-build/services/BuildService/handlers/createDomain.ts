import Config from "../../../config";
import DomainClient from "../../DomainClient";
import BuildService from "..";

const createDomain = async (
  service: BuildService,
  next: Function,
): Promise<void> => {
  const { deploymentId, subdomain, space, instanceId, publicIpAddress } =
    service;

  if (!deploymentId || !space || !instanceId || !publicIpAddress) {
    service.throw("Cannot find environment data before creating DNS Record.");
  }

  service.buildLog("creating a domain record for the project.");
  try {
    const domainClient = new DomainClient();
    const recordChangeInfo = await domainClient.createARecord(
      `${subdomain}.${Config.SERVER_URL}`,
      publicIpAddress,
    );

    if (!recordChangeInfo?.recordId) {
      service.throw("Cannot find record id after creating DNS Record.");
    }

    service.buildLog(
      `A new A record '${recordChangeInfo.recordId}' for ${publicIpAddress} has been requested.`,
    );

    service.recordId = recordChangeInfo.recordId;
  } catch (error) {
    service.buildErrorLog(
      `An error has occurred during deployment and the deployment data is currently being deleted...`,
    );

    service.throw(
      "An unexpected error occurred during creating DNS Record.",
      error,
    );
  }

  next();
};

export default createDomain;
