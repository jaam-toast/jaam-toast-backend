import { RunInstancesCommand } from "@aws-sdk/client-ec2";

import ec2Client from "./libs/ec2Client";

import { InstanceParams } from "../../types/custom";

const createInstance = async (instanceParams: InstanceParams) => {
  try {
    const data = await ec2Client.send(new RunInstancesCommand(instanceParams));

    if (data.Instances) {
      const instanceId = data.Instances[0].InstanceId;

      return instanceId;
    }
  } catch (err) {
  }
};

export default createInstance;
