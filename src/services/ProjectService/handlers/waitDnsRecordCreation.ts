import Config from "@src/config";
import DomainClient from "@src/services/DomainClient";
import log from "@src/services/Logger";

import ProjectService from "@src/services/ProjectService";

const waitDnsRecordCreation = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const domainClient = new DomainClient();
  const { subdomain, instanceId, recordId } = service;

  if (!instanceId || !recordId) {
    service.throw(
      "Cannot find environment data before waiting for DNS Record created.",
    );
  }

  log.build(
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

      log.build(
        `EC2 instance and record are ready. Waiting before requesting a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}...`,
      );

      next();
    }, 2000);
  } catch (error) {
    log.buildError(
      `An error has occurred during deployment and the deployment data is currently being deleted...`,
    );

    service.deleteDeployment();

    service.throw(
      "An unexpected error occurred while waiting for domain creation.",
      error,
    );
  }
};

export default waitDnsRecordCreation;
