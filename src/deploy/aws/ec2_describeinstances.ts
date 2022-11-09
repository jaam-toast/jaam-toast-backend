import { DescribeInstancesCommand } from "@aws-sdk/client-ec2";

import ec2Client from "./libs/ec2Client";

const describeInstanceIp = async (instanceId: string) => {
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
  }
};

export default describeInstanceIp;
