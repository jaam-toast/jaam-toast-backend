import Config from "../../config";

import describeLogStreams from "../aws/cwl_describelogstreams";

import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

export default async function getLogStreamStatus(
  instanceId: string,
  subdomain: string,
) {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  let logStreamStatus;

  try {
    logStreamStatus = await describeLogStreams(instanceId);

    debug(`logStreamStatus: [${logStreamStatus?.logStreamName}]`);

    debug(
      `Waiting before requesting a building log of ${subdomain}.${Config.SERVER_URL}...`,
    );

    return logStreamStatus;
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
