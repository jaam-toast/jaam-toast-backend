import Config from "../../config";

import createInstance from "../aws/ec2_createinstances";
import describeInstanceIp from "../aws/ec2_describeinstances";
import buildDeploymentCommands from "./buildDeploymentCommands";
import createDNSRecord from "../aws/route53_createrecord";
import runCertbot from "./runCertbot";
import runGetFilteredLogEvents from "./runGetFilteredLogEvents";

import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";

import { RRType } from "@aws-sdk/client-route-53";
import { RepoBuildOptions } from "../../types/custom";

export default async function createDeployment(
  repoBuildOptions: RepoBuildOptions,
) {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  debug("Creating deployment...", "Creating build commands...");

  const {
    repoName,
    repoCloneUrl,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    gitMetadata,
  } = repoBuildOptions;

  const clientOptions = { repoCloneUrl, repoName };
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

          if (recordChangeInfo?.recordId) {
            debug("Running certbot to request a certificate...");

            runCertbot(
              recordChangeInfo.recordId,
              instanceId as string,
              repoName,
            );

            debug(
              `Waiting for requesting a certificate to enable HTTPS on ${repoName}.${Config.SERVER_URL}...`,
            );

            runGetFilteredLogEvents(instanceId as string, repoName);

            debug(
              `Waiting for a building log of  ${repoName}.${Config.SERVER_URL}...`,
            );

            const newDeploymentInfo = {
              deployedUrl: `${repoName}.${Config.SERVER_URL}`,
              deployPublicAddress: publicIpAddress,
              deployRepoName: repoName,
              deployRemoteUrl: repoCloneUrl,
            };

            return newDeploymentInfo;
          } else {
            debug(
              `Error: 'recordChangeInfo.recordId' is expected to be a string`,
            );
            throw new DeploymentError({
              code: "route53Client",
              message: "recordChangeInfo.recordId is typeof undefined",
            });
          }
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
