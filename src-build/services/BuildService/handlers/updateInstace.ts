import { spawn } from "child_process";

import Config from "../../../config";
import log from "../../Logger";
import getUpdateInstanceCommands from "../utils/getUpdateCommands";

import ProjectService from "..";

async function updateInstance(
  service: ProjectService,
  next: Function,
): Promise<void> {
  const { instanceId, subdomain } = service;

  if (!instanceId || !subdomain) {
    service.throw(
      "Cannot find 'instanceId' or 'subdomain' before updating EC2 instance.",
    );
  }

  const controller = new AbortController();
  const { signal } = controller;

  log.build(
    `Requesting git pull commands to update the deployed website - ${subdomain}.${Config.SERVER_URL}`,
  );

  try {
    const commands = getUpdateInstanceCommands(instanceId, subdomain);
    const ssmUpdateDeploymentCommands = spawn("aws", commands, { signal });

    ssmUpdateDeploymentCommands.stdout.on("data", data => {
      log.build(
        `stdout data: ssmUpdateDeploymentCommands - ${data}`,
        `Successfully requesting git pull commands through ssmUpdateDeploymentCommands...`,
      );
    });

    ssmUpdateDeploymentCommands.stderr.on("data", data => {
      service.throw(
        "Error stderr data: An unexpected error occurred running git pull commands",
        new Error(data),
      );
    });

    ssmUpdateDeploymentCommands.stderr.on("error", err => {
      service.throw("An unexpected error occurred running git pull commands");
    });

    ssmUpdateDeploymentCommands.on("close", code => {
      log.build(
        `stdout: ssmUpdateDeploymentCommands child process exits with code - ${code}`,
        `git pull commands for ${subdomain}.${Config.SERVER_URL} has been requested`,
      );
    });

    log.build(
      `Successfully requested for deploymnet updates of the new pull request from Github webhook`,
    );
  } catch (error) {
    controller.abort();

    service.throw(
      `An unexpected error occurred requesting git pull commands for ${subdomain}.${Config.SERVER_URL}`,
      error,
    );
  }
}

export default updateInstance;
