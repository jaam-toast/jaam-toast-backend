import { spawn } from "child_process";

import Config from "../../config";
import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import ProjectService from ".";

const createHttpsCertification = async (
  service: ProjectService,
  next: Function,
) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const { subdomain, instanceId } = service;

  if (!instanceId) {
    debug(
      "Error: Cannot find instance id before creating HTTPS certification.",
    );

    throw new DeploymentError({
      code: "Projectservice_createHttpsCertification",
      message: "createHttpsCertification didn't work as expected",
    });
  }

  const controller = new AbortController();
  const { signal } = controller;

  debug(
    `letsencrypt - Plugins selected: Authenticator nginx, Installer nginx`,
    `Requesting a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}`,
  );

  try {
    const ssmCertbotCommands = spawn(
      "aws",
      [
        "ssm",
        "send-command",
        "--document-name",
        "AWS-RunShellScript",
        "--targets",
        `[{"Key":"InstanceIds","Values":["${instanceId}"]}]`,
        "--parameters",
        `{"commands":["#!/bin/bash","yum -y update","source /root/.nvm/nvm.sh","cd /home/ec2-user","certbot --nginx --non-interactive --agree-tos -d ${subdomain}.${Config.SERVER_URL} -m taewan.seoul@gmail.com","cd /etc","echo 39      1,13    *       *       *       root    certbot renew --no-self-upgrade >> crontab","systemctl restart crond","service nginx restart"]}`,
      ],
      { signal },
    );

    ssmCertbotCommands.stdout.on("data", data => {
      process.stderr.write(`stdout data: ssmCertbotCommands - ${data}`);
      debug(`stdout data: ssmCertbotCommands - ${data}`);

      debug(
        `Successfully requesting for a certificate through ssmCertbotCommands...`,
      );
    });

    ssmCertbotCommands.stderr.on("data", data => {
      debug(
        `Error stderr data: An unexpected error occurred running certbot commands - ${data}`,
      );
      throw new Error(
        `Error: The command failed. stderr: ssmCertbotCommands - ${data}`,
      );
    });

    ssmCertbotCommands.stderr.on("error", err => {
      debug(
        `Error stderr error: An unexpected error occurred running certbot commands - ${err}`,
      );
      throw new Error(
        `Error: The command failed. Chlid process exited. stderr: ssmCertbotCommands - ${err.name} (${err.message})`,
      );
    });

    ssmCertbotCommands.on("close", code => {
      process.stderr.write(
        `stdout: ssmCertbotCommands child process exits with code - ${code}`,
      );

      debug(
        `A new certificate for ${subdomain}.${Config.SERVER_URL} has been requested`,
      );
    });
  } catch (error) {
    controller.abort();

    debug(
      `Error: An unexpected error occurred during creating HTTPS certification. - ${error}.`,
    );

    throw new DeploymentError({
      code: "Projectservice_createHttpsCertification",
      message: "createHttpsCertification didn't work as expected",
    });
  }
};

export default createHttpsCertification;
