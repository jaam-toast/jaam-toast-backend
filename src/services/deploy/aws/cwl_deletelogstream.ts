import { DeleteLogStreamCommand } from "@aws-sdk/client-cloudwatch-logs";

import cwlClient from "./libs/cloudWatchLogsClient";
import log from "@src/services/Logger";

const deleteLogStream = async (instanceId: string) => {
  const logStreamsParams = {
    logGroupName: "user-data.log",
    logStreamName: instanceId,
  };

  try {
    const command = new DeleteLogStreamCommand(logStreamsParams);

    const data = await cwlClient.send(command);

    log.debug(
      `Successfully deleted a user-data.log of ${instanceId} - ${data}`,
    );
  } catch (error) {
    log.serverError(
      `An unexpected error occurred during DeleteLogStreamCommand_user-data.log - ${error}`,
    );

    throw error;
  }
};

export default deleteLogStream;
