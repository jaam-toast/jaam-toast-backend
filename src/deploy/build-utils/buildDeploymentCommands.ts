import Config from "../../config";

import { ClientOptions, DeploymentOptions } from "../../types/custom";
import { createDeploymentDebug } from "../../utils/createDebug";
import setNginxScript from "../aws/config/setNginxScript";

export default function buildDeploymentCommands(
  clientOptions: ClientOptions,
  deploymentOptions: DeploymentOptions = {
    nodeVersion: "16.x",
    installCommand: "",
    buildCommand: "",
    buildType: "SSR",
  },
) {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const { repoCloneUrl, repoName } = clientOptions;
  const { nodeVersion, installCommand, buildCommand, envList, buildType } =
    deploymentOptions;

  const GIT_CLONE_URL = repoCloneUrl.replace(
    "https://github.com",
    `https://${Config.USER_CREDENTIAL_TOKEN}@github.com`,
  );
  const REPO_NAME = repoName;
  const NODE_VERSION = nodeVersion.includes("14")
    ? Config.NODEJS_FERMIUM
    : Config.NODEJS_GALLIUM;
  const CUSTOM_DOMAIN = `${REPO_NAME}.${Config.SERVER_URL}`;
  const PM2_START_COMMAND = buildType.includes("SPA")
    ? `pm2 start npm --name "react-scripts" -- start`
    : `pm2 start npm --name "next" -- start`;

  const isUsingYarn = (command: string) => {
    return command.includes("yarn") ? true : false;
  };

  const INSTALL_COMMAND = isUsingYarn(installCommand)
    ? `yarn install`
    : `npm install --legacy-peer-deps`;
  const BUILD_COMMAND = isUsingYarn(buildCommand)
    ? `yarn build`
    : `npm run build`;

  const NGINX_SCRIPT = setNginxScript(buildType, CUSTOM_DOMAIN, REPO_NAME);

  debug(
    `GIT_CLONE_URL: ${repoCloneUrl}, REPO_NAME: ${repoName}, NODE_VERSION: ${NODE_VERSION}, CUSTOM_DOMAIN: ${REPO_NAME}.${Config.SERVER_URL}, PM2_START_COMMAND: ${PM2_START_COMMAND},INSTALL_COMMAND: ${INSTALL_COMMAND}, BUILD_COMMAND: ${BUILD_COMMAND}, NGINX_SCRIPT: ${NGINX_SCRIPT}`,
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
    `source /root/.nvm/nvm.sh`,
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

  const npmBuild = [`${INSTALL_COMMAND}`, `${BUILD_COMMAND}`];

  const setNginx = NGINX_SCRIPT;

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
    `sudo env PATH=$PATH:/home/ec2-user/.nvm/versions/node/v16.18.0/bin /home/ec2-user/.config/yarn/global/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user`,
    `${PM2_START_COMMAND}`,
    `export PM2_HOME="/etc/.pm2"`,
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
