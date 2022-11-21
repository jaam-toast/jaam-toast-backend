import Config from "../../config";

import createInstance from "../aws/ec2_createinstances";
import buildDeploymentCommands from "./buildDeploymentCommands";

import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";

import { RepoBuildOptions } from "../../types/custom";

export default async function createDeploymentInstance(
  repoBuildOptions: RepoBuildOptions,
) {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  debug("Creating deployment...", "Creating build commands...");

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
    gitMetadata,
  } = repoBuildOptions;

  const clientOptions = { repoOwner, repoName, repoCloneUrl, repoUpdatedAt };
  const deploymentOptions = {
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    buildType,
  };

  const commands = buildDeploymentCommands(clientOptions, deploymentOptions);

  debug("Created build commands to create a new instance");

  try {
    const instanceId = await createInstance(commands);

    debug(`Created instance: ${instanceId}`);

    const newDeploymentData = {
      deployedUrl: `${repoName}.${Config.SERVER_URL}`,
      instanceId,
    };

    return newDeploymentData;
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during RunInstancesCommand - ${err}`,
    );
    throw new DeploymentError({
      code: "ec2Client_RunInstancesCommand",
      message: "RunInstancesCommand didn't work as expected",
    });
  }
}
