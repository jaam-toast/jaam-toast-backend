import { FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

import Config from "../../config";
import cwlClient from "./libs/cloudWatchLogsClient";

import { DeploymentError } from "../../utils/errors";
import {
  createDeploymentDebug,
  createBuildingLogDebug,
} from "../../utils/createDebug";

const getFilteredLogEvents = async (instanceId: string, subdomain: string) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const debugBuildingLog = createBuildingLogDebug(Config.CLIENT_OPTIONS.debug);

  debug(
    `Requesting a building log of newly created deployment - ${subdomain}.${Config.SERVER_URL}...`,
  );

  const filterLogEventsParams = {
    logGroupName: "user-data.log",
    logStreamNames: [instanceId],
    filterPattern: Config.LOG_FILTERS.userDataFilter,
  };

  try {
    const command = new FilterLogEventsCommand(filterLogEventsParams);

    const data = await cwlClient.send(command);

    if (data.events) {
      const filteredLogEvent = data.events;

      debug(
        "Sending back to client of the newly created deployment buliding log...",
      );

      const filteredLogEventMessages = filteredLogEvent.map(log => {
        const ipSimpleRegex = / ip-\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}/;
        const filteredMessage = log.message?.replace(ipSimpleRegex, "");

        return filteredMessage;
      });

      filteredLogEventMessages.forEach((bulidingLog, i) =>
        setTimeout(() => {
          debugBuildingLog(bulidingLog as string);
        }, i * 100),
      );

      debug(
        `A building log of newly created deployment - ${subdomain}.${Config.SERVER_URL} has been requested`,
      );

      return filteredLogEventMessages;
    }
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during FilterLogEventsCommand - ${err}`,
    );
    throw new DeploymentError({
      code: "cwlClient_FilterLogEventsCommand",
      message: "FilterLogEventsCommand didn't work as expected",
    });
  }
};

export default getFilteredLogEvents;
