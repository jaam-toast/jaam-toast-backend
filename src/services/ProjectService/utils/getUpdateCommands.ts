const getUpdateInstanceCommands = (instanceId: string, repoName: string) => {
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
      `cd /home/ec2-user/jaamtoast/${repoName}`,
      "git pull",
      "npm install --legacy-peer-deps",
      "npm run build",
      "pm2 restart",
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

export default getUpdateInstanceCommands;
