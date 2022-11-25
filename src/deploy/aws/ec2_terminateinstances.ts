import { TerminateInstancesCommand } from "@aws-sdk/client-ec2";

import Config from "../../config";
import ec2Client from "./libs/ec2Client";

const terminateInstance = async (instanceId: string) => {
  const debug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);

  const instanceParams = { InstanceIds: [instanceId], DryRun: false };

  try {
    const command = new TerminateInstancesCommand(instanceParams);

    const data = await ec2Client.send(command);
  } catch (err) {
  }
};

export default terminateInstance;
