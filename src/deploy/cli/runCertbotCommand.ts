import { execa } from "execa";

async function runCertbotCommand(instanceId: string, subdomain: string) {
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
  } catch (err) {
  }
}

export default runCertbotCommand;
