import { TerminateInstancesCommand } from "@aws-sdk/client-ec2";

import Config from "../../config";
import ec2Client from "./libs/ec2Client";

import { CustomError } from "../../utils/errors";
import { createGeneralLogDebug } from "../../utils/createDebug";

const terminateInstance = async (instanceId: string) => {
  const debug = createGeneralLogDebug(Config.CLIENT_OPTIONS.debug);

  const instanceParams = { InstanceIds: [instanceId], DryRun: false };

  try {
    const command = new TerminateInstancesCommand(instanceParams);

    const data = await ec2Client.send(command);

    debug(`Successfully terminated an instance (${instanceId}) - ${data}`);
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during TerminateInstancesCommand - ${err}`,
    );
    throw new CustomError({
      code: "ec2Client_TerminateInstancesCommand",
      message: "TerminateInstancesCommand didn't work as expected",
    });
  }
};

export default terminateInstance;
