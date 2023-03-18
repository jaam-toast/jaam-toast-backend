import getLogStreamStatus from "@src/services/deploy/build-utils/getLogStreamStatus";
import getFilteredLogEvents from "@src/services/deploy/aws/cwl_filterlogeventscommand";
import log from "@src/services/Logger";

import { RRType } from "@aws-sdk/client-route-53";
import { DeploymentData } from "@src/types/custom";

export default async function runGetFilteredLogEvents(
  instanceId: string,
  subdomain: string,
  deploymentData: DeploymentData,
  ms = 2000,
  triesLeft = 50,
) {
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

        log.buildError(
          `'logStreamStatusInterval' attempted more than ${defaultTriesLeft} times, but didn't work as expected`,
        );

        // await terminateInstance(instanceId);
        // await deleteRepoWebhook(
        //   deploymentData.githubAccessToken as string,
        //   deploymentData.repoOwner,
        //   deploymentData.repoName,
        //   Number(deploymentData.webhookId),
        // );
        // await changeDNSRecord({
        //   actionType: "DELETE",
        //   subdomain: deploymentData.repoName,
        //   recordValue: deploymentData.publicIpAddress as string,
        //   recordType: RRType.A,
        // });

        reject(
          new Error(
            "'logStreamStatusInterval' attempted more than ${defaultTriesLeft} times, but didn't work as expecte",
          ),
        );
      }

      triesLeft--;
    }, ms);
  });
}
