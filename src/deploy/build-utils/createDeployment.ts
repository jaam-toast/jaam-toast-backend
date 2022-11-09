import Config from "../../config";

import createInstance from "../aws/ec2_createinstances";
import describeInstanceIp from "../aws/ec2_describeinstances";
import buildDeploymentCommands from "./buildDeploymentCommands";

import { createDeploymentDebug } from "../../utils/createDebug";

import { RepoBuildOptions } from "../../types/custom";

const createDeployment = async (repoBuildOptions: RepoBuildOptions) => {
  const debug = createDeploymentDebug(true);

  debug("Creating deployment...", "Creating build commands...");

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

  debug("Created build commands and instanceParams");

  try {
    const instanceId = await createInstance(instanceParams);

    debug(`Created instance - ${instanceId}`);

    try {
      const publicIpAddressInterval = setInterval(getPublicIpAddress, 1000);
      let publicIpAddress;

      async function getPublicIpAddress() {
        publicIpAddress = await describeInstanceIp(instanceId as string);

        debug("Creating instance public IP...");

        if (publicIpAddress) {
          clearInterval(publicIpAddressInterval);

          debug(`Created instance public IP - ${publicIpAddress}`);
        }
      }
    } catch (err) {
      debug(`Error: 'publicIpAddress' is expected to be a string - ${err}`);
    }
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during RunInstancesCommand - ${err}`,
    );
  }
};

export default createDeployment;
