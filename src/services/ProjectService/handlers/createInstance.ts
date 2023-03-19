import Config from "../../../config";
import InstanceClient from "../../InstanceClient";
import { createDeploymentDebug } from "../../../utils/createDebug";
import getUserDataCommands from "../utils/getUserDataCommands";
import { DeploymentError } from "../../../config/errors";

import ProjectService from "..";

const createInstance = async (service: ProjectService, next: Function) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
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
    debug("Error: Cannot find 'repoOwner' before creating EC2 instance.");

    throw new DeploymentError({
      code: "Projectservice_createInstance",
      message: "createInstance didn't work as expected",
    });
  }

  debug("Creating deployment...", "Creating build commands...");

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
    debug("Created build commands to create a new instance");

    const instanceClient = new InstanceClient();
    const instanceId = await instanceClient.create(commands);
    const deployedUrl = `${repoName}.${Config.SERVER_URL}`;

    service.instanceId = instanceId;
    service.deployedUrl = deployedUrl;

    debug(`Created instance: ${instanceId}`);
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during creating EC2 instance - ${error}.`,
    );

    throw new DeploymentError({
      code: "Projectservice_createInstance",
      message: "createInstance didn't work as expected",
    });
  }

  if (!service.deployedUrl || !service.instanceId) {
    debug("Error: Cannot find EC2 instance data after creating EC2 instance.");

    throw new DeploymentError({
      code: "Projectservice_createInstance",
      message: "createInstance didn't work as expected",
    });
  }

  next();
};

export default createInstance;
