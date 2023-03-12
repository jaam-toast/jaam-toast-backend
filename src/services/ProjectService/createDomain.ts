import changeDNSRecord from "../../services/deploy/aws/route53_changerecord";
import terminateInstance from "../../services/deploy/aws/ec2_terminateinstances";

import { DeploymentError } from "../../utils/errors";

import { RRType } from "@aws-sdk/client-route-53";
import { deleteRepoWebhook } from "../../services/GithubService/client";
import ProjectService from ".";

const createDomain = async (service: ProjectService, next: Function) => {
  const {
    githubAccessToken,
    repoName,
    repoOwner,
    instanceId,
    webhookId,
    publicIpAddress,
  } = service;

  if (
    !repoName
    || !repoOwner
    || !instanceId
    || !webhookId
    || !publicIpAddress
  ) {
    // to Be
    return;
  }

  try {
    const DNSRecordChangeOptions = {
      actionType: "CREATE",
      subdomain: repoName,
      recordValue: publicIpAddress,
      recordType: RRType.A,
      instanceId,
    };

/*
  * to Be
  * Route53Client.createARecord(createARecordOption);
*/

    const recordChangeInfo = await changeDNSRecord(DNSRecordChangeOptions);

    if (!recordChangeInfo?.recordId) {
      service.debug(
        `Error: 'recordChangeInfo.recordId' is expected to be a string`,
      );
      return service.throwError({
        code: "route53Client",
        message: "recordChangeInfo.recordId is typeof undefined",
      });
    }

    service.debug(
      `A new A record '${recordChangeInfo.recordId}' for ${publicIpAddress} has been requested: [${recordChangeInfo.recordStatus}] - at ${recordChangeInfo.recordCreatedAt}`,
    );

    service.recordId = recordChangeInfo.recordId;
  } catch (err) {
    service.debug(`Error: 'publicIpAddress' is expected to be a string - ${err}`);

    await terminateInstance(instanceId);
    await deleteRepoWebhook(
      githubAccessToken as string,
      repoOwner,
      repoName,
      Number(webhookId),
    );

    throw new DeploymentError({
      code: "ec2Client_DescribeInstancesCommand",
      message: "publicIpAddress is typeof undefined",
    });
  }

  next();
};

export default createDomain;
