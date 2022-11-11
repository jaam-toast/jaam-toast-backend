import { InstanceStateName } from "@aws-sdk/client-ec2";
import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import describeInstanceIp from "../aws/ec2_describeinstances";
import describeRecord from "../aws/route53_describerecord";
import runCertbotCommand from "../cli/runCertbotCommands";

export default function runCertbot(
  recordId: string,
  instanceId: string,
  subdomain: string,
) {
  const debug = createDeploymentDebug(true);

  const recordStatusInterval = setInterval(getRecordStatus, 1000);

  async function getRecordStatus() {
    let recordStatus;
    let instanceState;

    try {
      const instanceChangeInfo = await describeInstanceIp(instanceId);

      recordStatus = await describeRecord(recordId);
      instanceState = instanceChangeInfo?.instanceStateName;

      debug(
        `Checking recordStatus - [${recordStatus}]`,
        `Checking instanceState - [${instanceState}]`,
      );

      if (
        recordStatus === "INSYNC" &&
        instanceState === InstanceStateName.running
      ) {
        clearInterval(recordStatusInterval);

        setTimeout(() => runCertbotCommand(instanceId, subdomain), 120000);

        return recordStatus;
      }
    } catch (err) {
      debug(`Error: 'recordStatus' is expected to be a string - ${err}`);
      throw new DeploymentError({
        code: "route53Client_GetChangeCommand",
        message: "recordStatus is typeof undefined",
      });
    }
  }
}
