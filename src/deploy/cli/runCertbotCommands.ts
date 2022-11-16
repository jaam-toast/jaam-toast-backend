import { spawn } from "child_process";

import Config from "../../config";

import { DeploymentError } from "../../utils/errors";
import { createCertbotDebug } from "../../utils/createDebug";

async function runCertbotCommands(instanceId: string, subdomain: string) {
  const debug = createCertbotDebug(Config.CLIENT_OPTIONS.debug);

  const controller = new AbortController();
  const { signal } = controller;

  debug(
    `letsencrypt - Plugins selected: Authenticator nginx, Installer nginx`,
    `Requesting a certificate to enable HTTPS on ${subdomain}.jaamtoast.click `,
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
        `{"commands":["#!/bin/bash","yum -y update",". /root/.nvm/nvm.sh","cd /home/ec2-user","certbot --nginx --non-interactive --agree-tos -d ${subdomain}.jaamtoast.click -m taewan.seoul@gmail.com","cd /etc","echo 39      1,13    *       *       *       root    certbot renew --no-self-upgrade >> crontab","systemctl restart crond","service nginx restart"]}`,
      ],
      { signal },
    );

    ssmCertbotCommands.stdout.on("data", data => {
      debug(`stdout: ssmCertbotCommands - ${data}`);
    });

    ssmCertbotCommands.stderr.on("data", data => {
      debug(
        `stderr: ssmCertbotCommands - ${data}`,
        `ERROR: The command failed. stderr: ${data.stderr}`,
      );
    });

    ssmCertbotCommands.stderr.on("error", err => {
      debug(
        `stderr: ssmCertbotCommands - ${err}`,
        `ERROR: The command failed. Chlid process exited. stderr: ${err.name} (${err.message})`,
      );
    });

    debug(`A certificate for ${subdomain}.jaamtoast.click has been requested`);
  } catch (err) {
    controller.abort();
    debug(
      `Error: An unexpected error occurred requesting a certificate for ${subdomain}.jaamtoast.click - ${err}`,
    );
    throw new DeploymentError({
      code: "letsencrypt_certbot",
      message: "letsencrypt certbot didn't work as expected",
    });
  }
}

export default runCertbotCommands;
