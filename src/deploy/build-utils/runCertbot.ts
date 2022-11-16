import { InstanceStateName } from "@aws-sdk/client-ec2";

import Config from "../../config";
import describeInstanceIp from "../aws/ec2_describeinstances";
import describeRecord from "../aws/route53_describerecord";
import runCertbotCommands from "../cli/runCertbotCommands";

import { createDeploymentDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

export default function runCertbot(
  recordId: string,
  instanceId: string,
  subdomain: string,
) {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const recordStatusInterval = setInterval(getRecordStatus, 2000);

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

      debug(
        `Still waiting for requesting a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}...`,
      );

      if (
        recordStatus === "INSYNC" &&
        instanceState === InstanceStateName.running
      ) {
        clearInterval(recordStatusInterval);

        setTimeout(() => runCertbotCommands(instanceId, subdomain), 120000);

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
