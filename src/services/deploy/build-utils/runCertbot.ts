import { InstanceStateName } from "@aws-sdk/client-ec2";
import { RRType } from "@aws-sdk/client-route-53";

import Config from "../../../config";
import runCertbotCommands from "../cli/runCertbotCommands";
import getRecordInstanceStatus from "./getRecordInstanceStatus";
import terminateInstance from "../aws/ec2_terminateinstances";
import changeDNSRecord from "../aws/route53_changerecord";
import { deleteRepoWebhook } from "../../../api/github/client";

import { createCertbotDebug } from "../../../utils/createDebug";
import { DeploymentError } from "../../../utils/errors";

import { DeploymentData, RecordInstaceStatus } from "../../../types/custom";

export default async function runCertbot(
  instanceId: string,
  recordId: string,
  subdomain: string,
  deploymentData: DeploymentData,
  ms = 2000,
  triesLeft = 50,
) {
  const debug = createCertbotDebug(Config.CLIENT_OPTIONS.debug);
  const defaultTriesLeft = triesLeft;

  return new Promise<RecordInstaceStatus>((resolve, reject) => {
    const recordStatusInterval = setInterval(async () => {
      const recordInstaceStatus = await getRecordInstanceStatus(
        instanceId,
        recordId,
        subdomain,
      );
      const { recordStatus, instanceState } = recordInstaceStatus;

      const runCertbotCommandsDelay = async (ms: number) => {
        return new Promise<void>(resolve =>
          setTimeout(
            () => resolve(runCertbotCommands(instanceId, subdomain)),
            ms,
          ),
        );
      };

      if (
        recordStatus === "INSYNC" &&
        instanceState === InstanceStateName.running
      ) {
        clearInterval(recordStatusInterval);

        debug(
          `EC2 instance and record are ready. Waiting before requesting a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}...`,
        );

        await runCertbotCommandsDelay(120000);

        resolve(recordInstaceStatus);
      } else if (triesLeft <= 1) {
        clearInterval(recordStatusInterval);
        debug(
          `Error: 'recordStatusInterval' attempted more than ${defaultTriesLeft} times, but didn't work as expected`,
        );

        await terminateInstance(instanceId);
        await deleteRepoWebhook(
          deploymentData.githubAccessToken as string,
          deploymentData.repoOwner,
          deploymentData.repoName,
          Number(deploymentData.webhookId),
        );
        await changeDNSRecord({
          actionType: "DELETE",
          subdomain: deploymentData.repoName,
          recordValue: deploymentData.publicIpAddress as string,
          recordType: RRType.A,
        });

        reject(
          new DeploymentError({
            code: "runCertbot_recordStatusInterval",
            message: `'recordStatusInterval' attempted more than ${defaultTriesLeft} times, but didn't work as expected`,
          }),
        );
      }

      triesLeft--;
    }, ms);
  });
}
