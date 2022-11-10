import { RunInstancesCommand } from "@aws-sdk/client-ec2";

import ec2Client from "./libs/ec2Client";

import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";

import { InstanceParams } from "../../types/custom";

const createInstance = async (instanceParams: InstanceParams) => {
  const debug = createDeploymentDebug(true);

  try {
    const data = await ec2Client.send(new RunInstancesCommand(instanceParams));

    if (data.Instances) {
      const instanceId = data.Instances[0].InstanceId;

      return instanceId;
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
};

export default createInstance;
