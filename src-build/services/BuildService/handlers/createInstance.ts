import Config from "../../../config";
import InstanceClient from "../../InstanceClient";
import getUserDataCommands from "../utils/getUserDataCommands";

import DeployService from "..";

const createInstance = async (
  service: DeployService,
  next: Function,
): Promise<void> => {
  const {
    projectId,
    deploymentId,
    space,
    repoName,
    repoCloneUrl,
    subdomain,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    buildType,
  } = service;

  if (
    !projectId ||
    !deploymentId ||
    !space ||
    !repoName ||
    !repoCloneUrl ||
    !nodeVersion ||
    !installCommand ||
    !buildCommand ||
    !buildType
  ) {
    service.throw("Cannot find 'space' before creating EC2 instance.");
  }

  service.buildLog("Create a new project and begin a new deployment...");

  const clientOptions = {
    space,
    repoName,
    repoCloneUrl,
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
    service.buildLog(
      "Command creation for instance has been completed.",
      "Beginning instance creation....",
    );

    const instanceClient = new InstanceClient();
    const instanceId = await instanceClient.create(commands);
    const deployedUrl = `${subdomain}.${Config.SERVER_URL}`;

    service.instanceId = instanceId;
    service.deployedUrl = deployedUrl;

    service.buildLog("Instance creation has been completed.");
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
