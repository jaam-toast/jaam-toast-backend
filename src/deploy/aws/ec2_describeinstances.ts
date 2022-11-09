import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";

import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";

import ec2Client from "./libs/ec2Client";

const describeInstanceIp = async (instanceId: string) => {
  const debug = createDeploymentDebug(true);

  try {
    const data = await ec2Client.send(
      new DescribeInstancesCommand({ InstanceIds: [instanceId] }),
    );

    let publicIpAddress;

    if (data.Reservations) {
      const { Instances } = data.Reservations[0];

      if (Instances) {
        publicIpAddress = Instances[0].PublicIpAddress;
      }

      return publicIpAddress;
    }
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during DescribeInstancesCommand - ${err}`,
    );
    throw new DeploymentError({
      code: "ec2Client_DescribeInstancesCommand",
      message: "DescribeInstancesCommand didn't work as expected",
    });
  }
};

export default describeInstanceIp;
