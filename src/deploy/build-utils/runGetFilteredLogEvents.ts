import Config from "../../config";

import describeLogStreams from "../aws/cwl_describelogstreams";
import getFilteredLogEvents from "../aws/cwl_filterlogeventscommand";

import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

export default function runGetFilteredLogEvents(
  instanceId: string,
  subdomain: string,
) {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const logStreamStatusInterval = setInterval(getLogStreamStatus, 2000);

  async function getLogStreamStatus() {
    let logStreamStatus;

    try {
      logStreamStatus = await describeLogStreams(instanceId);

      debug(`Checking logStreamStatus - [${logStreamStatus?.logStreamName}]`);

      debug(
        `Still waiting for requesting a log stream on ${subdomain}.${Config.SERVER_URL}...`,
      );

      if (logStreamStatus?.logStreamName === instanceId) {
        clearInterval(logStreamStatusInterval);

        const filteredLogEventMessages = setTimeout(
          () => getFilteredLogEvents(instanceId, subdomain),
          70000,
        );

        return filteredLogEventMessages;
      }
    } catch (err) {
      debug(
        `Error: An unexpected error occurred during DescribeLogStreamsCommand - ${err}`,
      );
      throw new DeploymentError({
        code: "cloudWatchLogsClient_DescribeLogStreamsCommand",
        message: "logStreamStatus.logStreamName is typeof undefined",
      });
    }
  }
}
