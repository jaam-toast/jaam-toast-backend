import Config from "@src/config";
import InstanceClient from "@src/services/InstanceClient";
import log from "@src/services/Logger";
import getUserDataCommands from "../utils/getUserDataCommands";

import ProjectService from "@src/services/ProjectService";

const createInstance = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const {
    repoOwner,
    repoName,
    repoCloneUrl,
    repoUpdatedAt,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    buildType,
  } = service;

  if (
    !repoOwner ||
    !repoName ||
    !repoCloneUrl ||
    !repoUpdatedAt ||
    !nodeVersion ||
    !installCommand ||
    !buildCommand ||
    !buildType
  ) {
    service.throw("Cannot find 'repoOwner' before creating EC2 instance.");
  }

  log.build("Create a new project and begin a new deployment...");

  const clientOptions = {
    repoOwner,
    repoName,
    repoCloneUrl,
    repoUpdatedAt,
  };
  const deploymentOptions = {
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    buildType,
  };
  const commands = getUserDataCommands(clientOptions, deploymentOptions);

  try {
    log.build(
      "Command creation for instance has been completed. Beginning instance creation.",
    );

    const instanceClient = new InstanceClient();
    const instanceId = await instanceClient.create(commands);
    const deployedUrl = `${repoName}.${Config.SERVER_URL}`;

    service.instanceId = instanceId;
    service.deployedUrl = deployedUrl;

    log.build("Instance creation has been completed.");
  } catch (error) {
    service.throw(
      "An unexpected error occurred during instance creation.",
      error,
    );
  }

  if (!service.deployedUrl || !service.instanceId) {
    service.throw("Cannot find instance data after instance creation.");
  }

  next();
};

export default createInstance;
