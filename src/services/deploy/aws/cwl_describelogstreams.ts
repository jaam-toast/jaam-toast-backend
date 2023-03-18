import { DescribeLogStreamsCommand } from "@aws-sdk/client-cloudwatch-logs";

import cwlClient from "./libs/cloudWatchLogsClient";
import log from "@src/services/Logger";

const describeLogStreams = async (instanceId: string) => {
  const logStreamsParams = {
    logGroupName: "user-data.log",
    logStreamNamePrefix: instanceId,
  };

  try {
    const command = new DescribeLogStreamsCommand(logStreamsParams);

    const data = await cwlClient.send(command);

    return data?.logStreams?.[0];
  } catch (err) {
    log.buildError(
      `An unexpected error occurred during DescribeLogStreamsCommand - ${err}`,
    );
    throw new Error("DescribeLogStreamsCommand didn't work as expected");
  }
};

export default describeLogStreams;
