import { InstanceStateName } from "@aws-sdk/client-ec2";

import Config from "../../config";
import getRecordInstanceStatus from "../deploy/build-utils/getRecordInstanceStatus";
import terminateInstance from "../deploy/aws/ec2_terminateinstances";
import changeDNSRecord from "../deploy/aws/route53_changerecord";
import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import { RRType } from "@aws-sdk/client-route-53";
import ProjectService from "./";

const waitDnsRecordCreation = async (
  service: ProjectService,
  next: Function,
) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
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

      // TODO
      // 개별 확인
      const recordInstaceStatus = await getRecordInstanceStatus(
        instanceId,
        recordId,
        subdomain,
      );
      const { recordStatus, instanceState } = recordInstaceStatus;

      if (
        recordStatus !== "INSYNC" ||
        instanceState !== InstanceStateName.running
      ) {
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

    await terminateInstance(instanceId);
    await changeDNSRecord({
      actionType: "DELETE",
      subdomain,
      recordValue: service.publicIpAddress as string,
      recordType: RRType.A,
    });

    throw new DeploymentError({
      code: "Projectservice_waitDnsRecordCreation",
      message: "waitDnsRecordCreation didn't work as expected",
    });
  }
};

export default waitDnsRecordCreation;
