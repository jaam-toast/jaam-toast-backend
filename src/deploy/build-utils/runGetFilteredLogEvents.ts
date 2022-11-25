import Config from "../../config";
import getFilteredLogEvents from "../aws/cwl_filterlogeventscommand";
import getLogStreamStatus from "./getLogStreamStatus";
import terminateInstance from "../aws/ec2_terminateinstances";
import changeDNSRecord from "../aws/route53_changerecord";
import { deleteRepoWebhook } from "../../api/github/client";

import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import { RRType } from "@aws-sdk/client-route-53";
import { DeploymentData } from "../../types/custom";

export default async function runGetFilteredLogEvents(
  instanceId: string,
  subdomain: string,
  deploymentData: DeploymentData,
  ms = 2000,
  triesLeft = 50,
) {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const defaultTriesLeft = triesLeft;

  return new Promise<(string | undefined)[] | undefined>((resolve, reject) => {
    const logStreamStatusInterval = setInterval(async () => {
      const logStremStatus = await getLogStreamStatus(instanceId, subdomain);
      const logStreamName = logStremStatus?.logStreamName;

      const filteredLogDelay = async (ms: number) => {
        return new Promise<(string | undefined)[] | undefined>(resolve =>
          setTimeout(
            () => resolve(getFilteredLogEvents(instanceId, subdomain)),
            ms,
          ),
        );
      };

      if (logStreamName === instanceId) {
        clearInterval(logStreamStatusInterval);
        const filteredLogEventMessages = await filteredLogDelay(60000);

        resolve(filteredLogEventMessages);
      } else if (triesLeft <= 1) {
        clearInterval(logStreamStatusInterval);
        debug(
          `Error: 'logStreamStatusInterval' attempted more than ${defaultTriesLeft} times, but didn't work as expected`,
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
            code: "runGetFilteredLogEvents_logStreamStatusInterval",
            message: `'logStreamStatusInterval' attempted more than ${defaultTriesLeft} times, but didn't work as expected`,
          }),
        );
      }

      triesLeft--;
    }, ms);
  });
}
