import Config from "../../config";

import { ClientOptions, DeploymentOptions } from "../../types/custom";
import { createDeploymentDebug } from "../../utils/createDebug";

export default function buildDeploymentCommands(
  clientOptions: ClientOptions,
  deploymentOptions: DeploymentOptions = { nodeVersion: "16.x" },
) {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const { remoteUrl, repoName } = clientOptions;
  const { nodeVersion, envList } = deploymentOptions;

  const GIT_CLONE_URL = remoteUrl.replace(
    "https://github.com",
    `https://${Config.USER_CREDENTIAL_TOKEN}@github.com`,
  );
  const REPO_NAME = repoName;
  const NODE_VERSION = nodeVersion.includes("14")
    ? Config.NODEJS_FERMIUM
    : Config.NODEJS_GALLIUM;
  const CUSTOM_DOMAIN = `${REPO_NAME}.jaamtoast.click`;

  debug(
    `GIT_CLONE_URL: ${remoteUrl}, REPO_NAME: ${repoName}, NODE_VERSION: ${NODE_VERSION}, CUSTOM_DOMAIN: ${REPO_NAME}.jaamtoast.click`,
  );

  const yumUpdate = [
    `#!/usr/bin/bash`,
    `yum update -y`,
    `exec > >(tee /var/log/user-data.log|logger -t user-data -s 2>/dev/console) 2>&1`,
  ];

  const cloudWatchAgent = [
    `yum install amazon-cloudwatch-agent`,
    `yum install -y collectd`,
    `cd /opt/aws/amazon-cloudwatch-agent/bin`,
    `/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s -c file:config.json`,
  ];

  const nvmInstall = [
    `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash`,
    `. /root/.nvm/nvm.sh`,
    `nvm install ${NODE_VERSION}`,
  ];

  const gitClone = [
    `cd /home/ec2-user/jaamtoast`,
    `git clone ${GIT_CLONE_URL}`,
  ];

  const setEnv = [`cd ${REPO_NAME}`, `touch .env`];
  envList?.forEach(({ key, value }) => {
    setEnv.push(`echo ${key}=${value} >> .env`);
  });

  const npmBuild = [`npm install --legacy-peer-deps`, `npm run build`];

  const setNginx = [
    `cd /etc/nginx/conf.d`,
    `echo '
  server {
    listen 80;
    listen [::]:80;

    server_name ${CUSTOM_DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:3000;
				proxy_http_version  1.1;

        proxy_set_header    Host                \$host;
        proxy_set_header    X-Real-IP           \$remote_addr;
        proxy_set_header    X-Forwarded-For     \$proxy_add_x_forwarded_for;
    }
  }
    ' > default.conf`,
  ];

  const setCertbot = [
    `cd /home/ec2-user`,
    "wget -r --no-parent -A 'epel-release-*.rpm' https://dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/",
    "rpm -Uvh dl.fedoraproject.org/pub/epel/7/x86_64/Packages/e/epel-release-*.rpm",
    "yum-config-manager --enable epel*",
    "amazon-linux-extras install epel -y",
    "yum install -y certbot python2-certbot-apache",
    "yum install certbot-nginx -y",
    "service nginx restart",
  ];

  const setSSMAgent = [
    `yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm`,
    `systemctl status amazon-ssm-agent`,
    `systemctl start amazon-ssm-agent`,
  ];

  const pm2Start = [
    `npm install pm2 -g`,
    `cd /home/ec2-user/jaamtoast/${REPO_NAME}`,
    `pm2 start npm --name "next" -- start`,
    `pm2 save`,
    `pm2 startup`,
  ];

  const commands = [
    ...yumUpdate,
    ...cloudWatchAgent,
    ...nvmInstall,
    ...gitClone,
    ...setEnv,
    ...npmBuild,
    ...setNginx,
    ...setCertbot,
    ...setSSMAgent,
    ...pm2Start,
  ];

  return commands;
}
