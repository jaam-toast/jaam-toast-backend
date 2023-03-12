import ProjectService from "./";
import getUserDataCommands from "./utils/getUserDataCommands";
import Config from "../../config";
import createEC2Instance from "../deploy/aws/ec2_createinstances";

const createInstance = async (service: ProjectService, next: Function) => {
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
    !repoOwner
    || !repoName
    || !repoCloneUrl
    || !repoUpdatedAt
    || !nodeVersion
    || !installCommand
    || !buildCommand
    || !envList
    || !buildType
  ) {
    // to Be
    return service.throwError({ code: "aa", message: "bb" });
  }

  service.debug("Creating deployment...", "Creating build commands...");

  const clientOptions = {
    repoOwner,
    repoName,
    repoCloneUrl,
    repoUpdatedAt
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
    service.debug("Created build commands to create a new instance");

    const instanceId = await createEC2Instance(commands);
    const deployedUrl = `${repoName}.${Config.SERVER_URL}`;

    service.instanceId = instanceId;
    service.deployedUrl = deployedUrl;

    service.debug(`Created instance: ${instanceId}`);
  } catch (error) {
    service.debug(
      `Error: An unexpected error occurred during RunInstancesCommand - ${error}`,
    );
    service.throwError({
      code: "ec2Client_RunInstancesCommand",
      message: "RunInstancesCommand didn't work as expected",
    });
  }

  if (!service.deployedUrl || !service.instanceId) {
    return service.throwError({
      code: "ec2Client_RunInstancesCommand",
      message: "There was a problem creating the instance.",
    });
  }

  next();
};

export default createInstance;
