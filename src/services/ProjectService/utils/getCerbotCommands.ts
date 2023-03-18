const getRunScriptCerbotCommands = (
  instanceId: string,
  url: string,
): string[] => {
  const targets = JSON.stringify([
    {
      Key: "InstanceIds",
      Values: [instanceId],
    },
  ]);
  const parameters = JSON.stringify({
    commands: [
      "#!/bin/bash",
      "yum -y update",
      "source /root/.nvm/nvm.sh",
      "cd /home/ec2-user",
      `certbot --nginx --non-interactive --agree-tos -d ${url} -m taewan.seoul@gmail.com`,
      "cd /etc",
      "echo 39      1,13    *       *       *       root    certbot renew --no-self-upgrade >> crontab",
      "systemctl restart crond",
      "service nginx restart",
    ],
  });

  return [
    "ssm",
    "send-command",
    "--document-name",
    "AWS-RunShellScript",
    "--targets",
    targets,
    "--parameters",
    parameters,
  ];
};

export default getRunScriptCerbotCommands;
