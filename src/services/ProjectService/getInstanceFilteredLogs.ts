import { FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

import Config from "../../config";
import cwlClient from "../deploy/aws/libs/cloudWatchLogsClient";
import {
  createDeploymentDebug,
  createBuildingLogDebug,
} from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import ProjectService from ".";

const getInstanceFilteredLogs = async (
  service: ProjectService,
  next: Function,
) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const debugBuildingLog = createBuildingLogDebug(Config.CLIENT_OPTIONS.debug);

  const { instanceId, subdomain } = service;

  if (!instanceId) {
    debug(
      "Error: Cannot find 'instanceId' before getting Instance runtime logs.",
    );

    throw new DeploymentError({
      code: "Projectservice_getInstanceFilteredLogs",
      message: "getInstanceFilteredLogs didn't work as expected",
    });
  }

  const filterLogEventsOptions = {
    logGroupName: "user-data.log",
    logStreamNames: [instanceId],
    filterPattern: Config.LOG_FILTERS.userDataFilter,
  };

  debug("Running getFilteredLogEvents to request a building log...");

  try {
    const command = new FilterLogEventsCommand(filterLogEventsOptions);
    const data = await cwlClient.send(command);

    debug(
      `A building log of newly created deployment - ${subdomain}.${Config.SERVER_URL} has been requested`,
    );

    if (!data.events) {
      return;
    }

    debug(
      `Successfully requested for a building log of ${subdomain}.${Config.SERVER_URL}...`,
    );

    const filteredLogEvent = data.events;
    const filteredLogEventMessages = filteredLogEvent.map(log => {
      const ipSimpleRegex = / ip-\d{1,3}-\d{1,3}-\d{1,3}-\d{1,3}/;
      const filteredMessage = log.message?.replace(ipSimpleRegex, "");

      return filteredMessage;
    });

    debug(
      "Sending back to client of the newly created deployment building log...",
    );

    filteredLogEventMessages.forEach((buildingLog, i) =>
      setTimeout(() => {
        debugBuildingLog(buildingLog as string);
      }, i * 100),
    );

    service.buildingLog = filteredLogEventMessages;
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during getting Instance runtime logs. - ${error}.`,
    );

    throw new DeploymentError({
      code: "Projectservice_getInstanceFilteredLogs",
      message: "getInstanceFilteredLogs didn't work as expected",
    });
  }

  next();
};

export default getInstanceFilteredLogs;
