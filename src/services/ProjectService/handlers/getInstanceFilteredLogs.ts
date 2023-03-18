import { FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

import Config from "@src/config";
import cwlClient from "@src/services/deploy/aws/libs/cloudWatchLogsClient";
import log from "@src/services/Logger";
import sleep from "../utils/sleep";

import ProjectService from "@src/services/ProjectService";

const getInstanceFilteredLogs = async (
  service: ProjectService,
  next: Function,
) => {
  const { instanceId, subdomain } = service;

  if (!instanceId) {
    service.throw(
      "Cannot find 'instanceId' before getting Instance runtime logs.",
    );
  }

  log.build("Running getFilteredLogEvents to request a building log...");

  await sleep(60000);

  try {
    const filterLogEventsOptions = {
      logGroupName: "user-data.log",
      logStreamNames: [instanceId],
      filterPattern: Config.LOG_FILTERS.userDataFilter,
    };
    const command = new FilterLogEventsCommand(filterLogEventsOptions);
    const data = await cwlClient.send(command);

    log.build(
      `A building log of newly created deployment - ${subdomain}.${Config.SERVER_URL} has been requested`,
    );

    if (!data.events) {
      return;
    }

    log.build(
      `Successfully requested for a building log of ${subdomain}.${Config.SERVER_URL}...`,
    );

    const filteredLogEvent = data.events;
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

    service.buildingLog = filteredLogEventMessages;
  } catch (error) {
    service.throw(
      "An unexpected error occurred during getting Instance runtime logs.",
      error,
    );
  }

  next();
};

export default getInstanceFilteredLogs;
