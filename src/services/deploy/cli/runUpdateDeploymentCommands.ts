import { spawn } from "child_process";

import Config from "../../../config";

import { DeploymentError } from "../../../utils/errors";
import { createBuildingLogDebug } from "../../../utils/createDebug";

async function runUpdateDeploymentCommands(
  instanceId: string,
  repoName: string,
) {
  const debug = createBuildingLogDebug(Config.CLIENT_OPTIONS.debug);

  const controller = new AbortController();
  const { signal } = controller;

  debug(
    `Requesting git pull commands to update the deployed website - ${repoName}.${Config.SERVER_URL}`,
  );

  try {
    const ssmUpdateDeploymentCommands = spawn(
      "aws",
      [
        "ssm",
        "send-command",
        "--document-name",
        "AWS-RunShellScript",
        "--targets",
        `[{"Key":"InstanceIds","Values":["${instanceId}"]}]`,
        "--parameters",
        `{"commands":["#!/bin/bash","yum -y update","source /root/.nvm/nvm.sh","cd /home/ec2-user/jaamtoast/${repoName}","git pull","npm install --legacy-peer-deps","npm run build","pm2 restart","service nginx restart"]}`,
      ],
      { signal },
    );

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
  } catch (err) {
    controller.abort();
    debug(
      `Error: An unexpected error occurred requesting git pull commands for ${repoName}.${Config.SERVER_URL} - ${err}`,
    );
    throw new DeploymentError({
      code: "aws-cli_ssmUpdateDeploymentCommands",
      message: "ssmUpdateDeploymentCommands didn't work as expected",
    });
  }
}

export default runUpdateDeploymentCommands;
