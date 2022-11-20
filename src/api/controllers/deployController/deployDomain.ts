import Config from "../../../config";

import describeInstanceIp from "../../../deploy/aws/ec2_describeinstances";
import createDNSRecord from "../../../deploy/aws/route53_createrecord";

import catchAsync from "../../../utils/asyncHandler";
import { DeploymentError } from "../../../utils/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

import { RRType } from "@aws-sdk/client-route-53";
import { RecordSetResponse } from "../../../types/custom";

let recordChangeInfo: RecordSetResponse | undefined;
let publicIpAddress: RecordSetResponse["publicIpAddress"];
let recordIdStatus: RecordSetResponse["recordId"];

const deployDomain = catchAsync(async (req, res, next) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const { repoName, instanceId } = req.deploymentData;

  try {
    const publicIpAddressInterval = setInterval(getPublicIpAddress, 2000);

    async function getPublicIpAddress() {
      const instanceChangeInfo = await describeInstanceIp(instanceId as string);

      publicIpAddress = instanceChangeInfo?.publicIpAddress;

      debug("Creating instance public IP...");

      if (publicIpAddress) {
        debug(`Created instance public IP: ${publicIpAddress}`);

        const createDNSRecordInput = {
          subdomain: repoName,
          recordValue: publicIpAddress,
          recordType: RRType.A,
        };

        if (recordIdStatus !== "PENDING" && recordIdStatus !== "INSYNC") {
          recordChangeInfo = await createDNSRecord(createDNSRecordInput);
        }

        if (!recordChangeInfo) {
          debug(
            `Error: 'recordChangeInfo.recordId' is expected to be a string`,
          );
          return next(
            new DeploymentError({
              code: "route53Client",
              message: "recordChangeInfo.recordId is typeof undefined",
            }),
          );
        }

        debug(
          `A new A record '${recordChangeInfo.recordId}' for ${publicIpAddress} has been requested: [${recordChangeInfo.recordStatus}] - at ${recordChangeInfo.recordCreatedAt}`,
        );

        recordIdStatus = recordChangeInfo?.recordStatus;

        if (recordChangeInfo?.recordId) {
          clearInterval(publicIpAddressInterval);

          req.deploymentData.recordId = recordChangeInfo.recordId;

          next();
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
});

export default deployDomain;
