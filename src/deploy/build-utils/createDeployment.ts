import Config from "../../config";

import createInstance from "../aws/ec2_createinstances";
import describeInstanceIp from "../aws/ec2_describeinstances";
import buildDeploymentCommands from "./buildDeploymentCommands";

import { RepoBuildOptions } from "../../types/custom";

const createDeployment = async (repoBuildOptions: RepoBuildOptions) => {

  const {
    repoName,
    remoteUrl,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    gitMetadata,
  } = repoBuildOptions;

  const clientOptions = { remoteUrl, repoName };
  const deploymentOptions = { nodeVersion, envList };

  const commands = buildDeploymentCommands(clientOptions, deploymentOptions);

  const instanceParams = {
    ImageId: Config.AMI_ID,
    InstanceType: Config.INSTANCE_TYPE,
    KeyName: Config.KEY_PAIR_NAME,
    MinCount: 1,
    MaxCount: 1,
    UserData: Buffer.from(commands.join("\n")).toString("base64"),
    IamInstanceProfile: {
      Arn: Config.IAM_INSTANCE_PROFILE,
    },
  };

  try {
    const instanceId = await createInstance(instanceParams);

    try {
      const publicIpAddressInterval = setInterval(getPublicIpAddress, 1000);
      let publicIpAddress;

      async function getPublicIpAddress() {
        publicIpAddress = await describeInstanceIp(instanceId as string);

        if (publicIpAddress) {
          clearInterval(publicIpAddressInterval);
        }
      }
    } catch (err) {
    }
  } catch (err) {
  }
};

export default createDeployment;
