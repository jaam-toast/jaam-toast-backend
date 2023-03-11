import {
  DescribeLogStreamsCommand,
  LogStream,
} from "@aws-sdk/client-cloudwatch-logs";

import Config from "../../../config";
import cwlClient from "./libs/cloudWatchLogsClient";

import { DeploymentError } from "../../../utils/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

const describeLogStreams = async (instanceId: string) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const logStreamsParams = {
    logGroupName: "user-data.log",
    logStreamNamePrefix: instanceId,
  };

  try {
    const command = new DescribeLogStreamsCommand(logStreamsParams);

    const data = await cwlClient.send(command);

    if (data.logStreams) {
      const logStream: LogStream = data.logStreams[0];

      return logStream;
    }
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during DescribeLogStreamsCommand - ${err}`,
    );
    throw new DeploymentError({
      code: "cloudWatchLogsClient_DescribeLogStreamsCommand",
      message: "DescribeLogStreamsCommand didn't work as expected",
    });
  }
};

export default describeLogStreams;
