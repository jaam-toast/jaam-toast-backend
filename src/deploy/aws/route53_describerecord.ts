import { GetChangeCommand } from "@aws-sdk/client-route-53";

import Config from "../../config";
import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import route53Client from "./libs/route53Client";

const describeRecord = async (Id: string) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  try {
    const command = new GetChangeCommand({ Id });

    const data = await route53Client.send(command);

    if (data.ChangeInfo) {
      const { Status } = data.ChangeInfo;

      const recordStatus = Status;

      return recordStatus;
    }
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during GetChangeCommand - ${err}`,
    );
    throw new DeploymentError({
      code: "route53Client_GetChangeCommand",
      message: "GetChangeCommand didn't work as expected",
    });
  }
};

export default describeRecord;
