import { spawn } from "child_process";

import Config from "../../../config";
import ProjectService from "..";
import { createBuildingLogDebug } from "../../../utils/createDebug";
import { DeploymentError } from "../../../config/errors";
import getUpdateInstanceCommands from "../utils/getUpdateCommands";

async function updateInstance(service: ProjectService, next: Function) {
  const debug = createBuildingLogDebug(Config.CLIENT_OPTIONS.debug);
  const { instanceId, repoName } = service;

  if (!instanceId || !repoName) {
    debug("Error: Cannot find 'instanceId' before updating EC2 instance.");

    throw new DeploymentError({
      code: "Projectservice_updateInstance",
      message: "updateInstance didn't work as expected",
    });
  }

  const controller = new AbortController();
  const { signal } = controller;

  debug(
    `Requesting git pull commands to update the deployed website - ${repoName}.${Config.SERVER_URL}`,
  );

  try {
    const commands = getUpdateInstanceCommands(instanceId, repoName);
    const ssmUpdateDeploymentCommands = spawn("aws", commands, { signal });

    ssmUpdateDeploymentCommands.stdout.on("data", data => {
      process.stderr.write(
        `stdout data: ssmUpdateDeploymentCommands - ${data}`,
      );
      debug(`stdout data: ssmUpdateDeploymentCommands - ${data}`);

      debug(
        `Successfully requesting git pull commands through ssmUpdateDeploymentCommands...`,
      );
    });

    ssmUpdateDeploymentCommands.stderr.on("data", data => {
      debug(
        `Error stderr data: An unexpected error occurred running git pull commands - ${data}`,
      );
      throw new Error(
        `Error stderr data: The command failed. stderr: ssmUpdateDeploymentCommands - ${data}`,
      );
    });

    ssmUpdateDeploymentCommands.stderr.on("error", err => {
      debug(
        `Error stderr error: An unexpected error occurred running git pull commands - ${err}`,
      );
      throw new Error(
        `Error: The command failed. Chlid process exited. stderr: ssmUpdateDeploymentCommands - ${err.name} (${err.message})`,
      );
    });

    ssmUpdateDeploymentCommands.on("close", code => {
      process.stderr.write(
        `stdout: ssmUpdateDeploymentCommands child process exits with code - ${code}`,
      );

      debug(
        `git pull commands for ${repoName}.${Config.SERVER_URL} has been requested`,
      );
    });

    debug(
      `Successfully requested for deploymnet updates of the new pull request from Github webhook`,
    );
  } catch (err) {
    controller.abort();

    debug(
      `Error: An unexpected error occurred requesting git pull commands for ${repoName}.${Config.SERVER_URL} - ${err}`,
    );

    throw new DeploymentError({
      code: "aws-cli_updateInstance",
      message: "updateInstance didn't work as expected",
    });
  }
}

export default updateInstance;
