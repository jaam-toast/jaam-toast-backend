import Config from "../../../config";
import describeInstanceIp from "../aws/ec2_describeinstances";
import describeRecord from "../aws/route53_describerecord";

import { createCertbotDebug } from "../../../utils/createDebug";
import { DeploymentError } from "../../../utils/errors";

export default async function getRecordInstanceStatus(
  instanceId: string,
  recordId: string,
  subdomain: string,
) {
  const debug = createCertbotDebug(Config.CLIENT_OPTIONS.debug);

  let recordStatus;
  let instanceState;

  try {
    const instanceChangeInfo = await describeInstanceIp(instanceId);

    recordStatus = await describeRecord(recordId);
    instanceState = instanceChangeInfo?.instanceStateName;

    debug(
      `recordStatus: [${recordStatus}]`,
      `instanceState: [${instanceState}]`,
    );

    const runCertbotResponse = {
      recordStatus,
      instanceState,
    };

    return runCertbotResponse;
  } catch (err) {
    debug(`Error: 'recordStatus' is expected to be a string - ${err}`);
    throw new DeploymentError({
      code: "route53Client_GetChangeCommand",
      message: "recordStatus is typeof undefined",
    });
  }
}
