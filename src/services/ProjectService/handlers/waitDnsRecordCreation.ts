import Config from "../../../config";
import DomainClient from "../../DomainClient";
import { createDeploymentDebug } from "../../../utils/createDebug";
import { DeploymentError } from "../../../config/errors";

import ProjectService from "..";

const waitDnsRecordCreation = async (
  service: ProjectService,
  next: Function,
) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const domainClient = new DomainClient();
  const { subdomain, instanceId, recordId } = service;

  if (!instanceId || !recordId) {
    debug(
      "Error: Cannot find environment data before waiting for DNS Record created.",
    );

    throw new DeploymentError({
      code: "Projectservice_waitDnsRecordCreation",
      message: "waitDnsRecordCreation didn't work as expected",
    });
  }

  debug(
    `Requesting for a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}...`,
  );

  try {
    let triesLeft = 50;

    const recordStatusInterval = setInterval(async () => {
      if (triesLeft <= 1) {
        clearInterval(recordStatusInterval);

        debug(
          `Error: Checking the DNS record was attempted more than 50 times but didn't work as expected.`,
        );

        throw new DeploymentError({
          code: "Projectservice_waitDnsRecordCreation",
          message: "waitDnsRecordCreation didn't work as expected",
        });
      }

      const recordStatus = await domainClient.getStatus(recordId);

      if (recordStatus !== "INSYNC") {
        triesLeft -= 1;
        return;
      }

      clearInterval(recordStatusInterval);

      debug(
        `EC2 instance and record are ready. Waiting before requesting a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}...`,
      );

      next();
    }, 2000);
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during waiting for DNS Record created. - ${error}.`,
    );

    service.deleteDeployment();

    throw new DeploymentError({
      code: "Projectservice_waitDnsRecordCreation",
      message: "waitDnsRecordCreation didn't work as expected",
    });
  }
};

export default waitDnsRecordCreation;
