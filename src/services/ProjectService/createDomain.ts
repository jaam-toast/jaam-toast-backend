import Config from "../../config";
import changeDNSRecord from "../../services/deploy/aws/route53_changerecord";
import terminateInstance from "../../services/deploy/aws/ec2_terminateinstances";
import { deleteRepoWebhook } from "../../services/GithubService/client";
import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import ProjectService from ".";
import { RRType } from "@aws-sdk/client-route-53";

const createDomain = async (service: ProjectService, next: Function) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const {
    githubAccessToken,
    subdomain,
    repoOwner,
    instanceId,
    webhookId,
    publicIpAddress,
  } = service;

  if (!repoOwner || !instanceId || !webhookId || !publicIpAddress) {
    debug("Error: Cannot find environment data before creating DNS Record.");

    throw new DeploymentError({
      code: "Projectservice_createDomain",
      message: "createDomain didn't work as expected",
    });
  }

  try {
    const DNSRecordChangeOptions = {
      actionType: "CREATE",
      subdomain: subdomain,
      recordValue: publicIpAddress,
      recordType: RRType.A,
      instanceId,
    };

    const recordChangeInfo = await changeDNSRecord(DNSRecordChangeOptions);

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

    await terminateInstance(instanceId);
    await deleteRepoWebhook(
      githubAccessToken as string,
      repoOwner,
      subdomain,
      Number(webhookId),
    );

    throw new DeploymentError({
      code: "Projectservice_createDomain",
      message: "createDomain didn't work as expected",
    });
  }

  next();
};

export default createDomain;
