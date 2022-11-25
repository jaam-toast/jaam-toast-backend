import { DeleteLogStreamCommand } from "@aws-sdk/client-cloudwatch-logs";

import Config from "../../config";
import cwlClient from "./libs/cloudWatchLogsClient";

const deleteLogStream = async (instanceId: string) => {
  const debug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);

  const logStreamsParams = {
    logGroupName: "user-data.log",
    logStreamName: instanceId,
  };

  try {
    const command = new DeleteLogStreamCommand(logStreamsParams);

    const data = await cwlClient.send(command);
  } catch (err) {
  }
};

export default deleteLogStream;
