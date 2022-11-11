import Config from "../../config";

import createInstance from "../aws/ec2_createinstances";
import describeInstanceIp from "../aws/ec2_describeinstances";
import buildDeploymentCommands from "./buildDeploymentCommands";

import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";

import { RepoBuildOptions } from "../../types/custom";

export default async function createDeployment(
  repoBuildOptions: RepoBuildOptions,
) {
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

  debug("Created build commands to create a new instance");

  try {
    const instanceId = await createInstance(commands);

    debug(`Created instance - ${instanceId}`);

    try {
      const publicIpAddressInterval = setInterval(getPublicIpAddress, 1000);
      let publicIpAddress;

      async function getPublicIpAddress() {
        const instanceChangeInfo = await describeInstanceIp(
          instanceId as string,
        );

        publicIpAddress = instanceChangeInfo?.publicIpAddress;

        debug("Creating instance public IP...");

        if (publicIpAddress) {
          clearInterval(publicIpAddressInterval);

          debug(`Created instance public IP - ${publicIpAddress}`);

          const createDNSRecordInput = {
            subdomain: repoName,
            recordValue: publicIpAddress,
            recordType: RRType.A,
          };

          const recordChangeInfo = await createDNSRecord(createDNSRecordInput);

          debug(
            `A new A record '${recordChangeInfo?.recordId}' for ${publicIpAddress} has been requested: [${recordChangeInfo?.recordStatus}] - at ${recordChangeInfo?.recordCreatedAt}`,
          );

        }
      }
    } catch (err) {
      debug(`Error: 'publicIpAddress' is expected to be a string - ${err}`);
      throw new DeploymentError({
        code: "ec2Client_DescribeInstancesCommand",
        message: "publicIpAddress is typeof undefined",
      });
    }
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during RunInstancesCommand - ${err}`,
    );
    throw new DeploymentError({
      code: "ec2Client_RunInstancesCommand",
      message: "RunInstancesCommand didn't work as expected",
    });
  }
}
