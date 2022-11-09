import { execa } from "execa";

import { DeploymentError } from "../../utils/errors";
import { createCertbotDebug } from "../../utils/createDebug";

async function runCertbotCommand(instanceId: string, subdomain: string) {
  const debug = createCertbotDebug(true);

  debug(
    `letsencrypt - Plugins selected: Authenticator nginx, Installer nginx`,
    `Requesting a certificate to enable HTTPS on ${subdomain}.jaamtoast.click `,
  );

  try {
    await execa("aws", [
      "ssm",
      "send-command",
      "--document-name",
      "AWS-RunShellScript",
      "--targets",
      `[{"Key":"InstanceIds","Values":["${instanceId}"]}]`,
      "--parameters",
      `{"commands":["#!/bin/bash","yum -y update",". /.nvm/nvm.sh","cd /home/ec2-user","certbot --nginx --non-interactive --agree-tos -d ${subdomain}.jaamtoast.click -m taewan.seoul@gmail.com","cd /etc","echo 39      1,13    *       *       *       root    certbot renew --no-self-upgrade >> crontab","systemctl restart crond","service nginx restart"]}`,
    ]);

    debug(`A certificate for ${subdomain}.jaamtoast.click has been requested`);
  } catch (err) {
    debug(
      `Error: An unexpected error occurred requesting a certificate for ${subdomain}.jaamtoast.click - ${err}`,
    );
    throw new DeploymentError({
      code: "letsencrypt_certbot",
      message: "letsencrypt certbot didn't work as expected",
    });
  }
}

export default runCertbotCommand;
