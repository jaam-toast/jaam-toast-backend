import { RunInstancesCommand } from "@aws-sdk/client-ec2";

import Config from "../../config";
import ec2Client from "./libs/ec2Client";

import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";

const createInstance = async (commands: string[]) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

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

  try {
    const command = new RunInstancesCommand(instanceParams);

    const data = await ec2Client.send(command);

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
