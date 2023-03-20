import { FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

import Config from "@src/config";
import cwlClient from "./libs/cloudWatchLogsClient";

import log from "@src/services/Logger";

const getFilteredLogEvents = async (instanceId: string, subdomain: string) => {
  const filterLogEventsParams = {
    logGroupName: "user-data.log",
    logStreamNames: [instanceId],
    filterPattern: Config.LOG_FILTERS.userDataFilter,
  };

  log.build("Running getFilteredLogEvents to request a building log...");

  try {
    const command = new FilterLogEventsCommand(filterLogEventsParams);

    const data = await cwlClient.send(command);

    log.build(
      `A building log of newly created deployment - ${subdomain}.${Config.SERVER_URL} has been requested`,
    );

    if (data.events) {
      const filteredLogEvent = data.events;

      log.build(
        `Successfully requested for a building log of  ${subdomain}.${Config.SERVER_URL}...`,
      );

      const filteredLogEventMessages = filteredLogEvent.map(log => {
        const ipSimpleRegex = / ip-\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}/;
        const filteredMessage = log.message?.replace(ipSimpleRegex, "");

        return filteredMessage;
      });

      log.build(
        "Sending back to client of the newly created deployment building log...",
      );

      filteredLogEventMessages.forEach((buildingLog, i) =>
        setTimeout(() => {
          log.build(buildingLog as string);
        }, i * 100),
      );

      return filteredLogEventMessages;
    }
  } catch (err) {
    log.buildError(
      `An unexpected error occurred during FilterLogEventsCommand - ${err}`,
    );
    throw new Error("FilterLogEventsCommand didn't work as expected");
  }
};

export default getFilteredLogEvents;
