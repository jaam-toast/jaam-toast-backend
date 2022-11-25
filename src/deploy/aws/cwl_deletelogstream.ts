import { DeleteLogStreamCommand } from "@aws-sdk/client-cloudwatch-logs";

import Config from "../../config";
import cwlClient from "./libs/cloudWatchLogsClient";

import { CustomError } from "../../utils/errors";
import { createGeneralLogDebug } from "../../utils/createDebug";

const deleteLogStream = async (instanceId: string) => {
  const debug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);

  const logStreamsParams = {
    logGroupName: "user-data.log",
    logStreamName: instanceId,
  };

  try {
    const command = new DeleteLogStreamCommand(logStreamsParams);

    const data = await cwlClient.send(command);

    debug(`Successfully deleted a user-data.log of ${instanceId} - ${data}`);
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during DeleteLogStreamCommand_user-data.log - ${err}`,
    );
    throw new CustomError({
      code: "cloudWatchLogsClient_DeleteLogStreamCommand_user-data.log",
      message: "DeleteLogStreamCommand_user-data.log didn't work as expected",
    });
  }
};

export default deleteLogStream;
