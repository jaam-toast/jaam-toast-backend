import Config from "../../../config";

import describeInstanceIp from "../../../deploy/aws/ec2_describeinstances";
import changeDNSRecord from "../../../deploy/aws/route53_changerecord";

import catchAsync from "../../../utils/asyncHandler";
import { DeploymentError } from "../../../utils/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

import { RRType } from "@aws-sdk/client-route-53";
import { RecordSetResponse } from "../../../types/custom";

const deployDomain = catchAsync(async (req, res, next) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  let recordChangeInfo: RecordSetResponse | undefined = undefined;
  let publicIpAddress: RecordSetResponse["publicIpAddress"] = undefined;
  let recordIdStatus: RecordSetResponse["recordId"] = undefined;

  const { repoName, instanceId } = req.deploymentData;

  try {
    const publicIpAddressInterval = setInterval(getPublicIpAddress, 2000);

    async function getPublicIpAddress() {
      const instanceChangeInfo = await describeInstanceIp(instanceId);

      publicIpAddress = instanceChangeInfo?.publicIpAddress;

      debug("Creating instance public IP...");

      if (publicIpAddress) {
        debug(`Created instance public IP: ${publicIpAddress}`);

        const changeDNSRecordInput = {
          actionType: "CREATE",
          subdomain: repoName,
          recordValue: publicIpAddress,
          recordType: RRType.A,
        };

        if (recordIdStatus !== "PENDING" && recordIdStatus !== "INSYNC") {
          recordChangeInfo = await changeDNSRecord(changeDNSRecordInput);
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
