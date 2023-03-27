import Config from "../../../config";
import DomainClient from "../../DomainClient";

import BuildService from "..";

const waitDnsRecordCreation = async (
  service: BuildService,
  next: Function,
): Promise<void> => {
  const domainClient = new DomainClient();
  const { subdomain, instanceId, recordId } = service;

  if (!instanceId || !recordId) {
    service.throw(
      "Cannot find environment data before waiting for DNS Record created.",
    );
  }

  service.buildLog(
    `Requesting for a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}...`,
  );

  try {
    let triesLeft = 50;

    const recordStatusInterval = setInterval(async () => {
      if (triesLeft <= 1) {
        clearInterval(recordStatusInterval);

        service.throw(
          "Checking the DNS record was attempted more than 50 times but didn't work as expected.",
        );
      }

      const recordStatus = await domainClient.getStatus(recordId);

      if (recordStatus !== "INSYNC") {
        triesLeft -= 1;
        return;
      }

      clearInterval(recordStatusInterval);

      service.buildLog(
        "instance and record are ready.",
        `Waiting before requesting a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}...`,
      );

      next();
    }, 2000);
  } catch (error) {
    service.buildErrorLog(
      `An error has occurred during deployment and the deployment data is currently being deleted...`,
    );

    service.throw(
      "An unexpected error occurred while waiting for domain creation.",
      error,
    );
  }
};

export default waitDnsRecordCreation;
