import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";

import Config from "../../config";
import ec2Client from "./libs/ec2Client";

import { CustomError } from "../../utils/errors";
import { createGeneralLogDebug } from "../../utils/createDebug";

const describeInstanceIp = async (instanceId: string) => {
  const debug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);

  const instanceParams = { InstanceIds: [instanceId] };

  try {
    const command = new DescribeInstancesCommand(instanceParams);

    const data = await ec2Client.send(command);

    let publicIpAddress;
    let instanceState;
    let instanceStateName;

    if (data.Reservations) {
      const { Instances } = data.Reservations[0];

      if (Instances) {
        publicIpAddress = Instances[0].PublicIpAddress;
        instanceState = Instances[0].State;
        instanceStateName = instanceState?.Name;
      }

      const instanceChangeInfo = {
        publicIpAddress,
        instanceStateName,
      };

      return instanceChangeInfo;
    }
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during DescribeInstancesCommand - ${err}`,
    );
    throw new CustomError({
      code: "ec2Client_DescribeInstancesCommand",
      message: "DescribeInstancesCommand didn't work as expected",
    });
  }
};

export default describeInstanceIp;
