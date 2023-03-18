import Config from "@src/config";
import describeLogStreams from "../aws/cwl_describelogstreams";
import log from "@src/services/Logger";

export default async function getLogStreamStatus(
  instanceId: string,
  subdomain: string,
) {
  let logStreamStatus;

  try {
    logStreamStatus = await describeLogStreams(instanceId);

    log.build(`logStreamStatus: [${logStreamStatus?.logStreamName}]`);

    log.build(
      `Waiting before requesting a building log of ${subdomain}.${Config.SERVER_URL}...`,
    );

    return logStreamStatus;
  } catch (error) {
    log.build(
      `An unexpected error occurred during DescribeLogStreamsCommand - ${error}`,
    );

    throw error;
  }
}
