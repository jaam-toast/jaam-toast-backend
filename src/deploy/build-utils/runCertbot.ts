import { InstanceStateName } from "@aws-sdk/client-ec2";

import Config from "../../config";
import runCertbotCommands from "../cli/runCertbotCommands";
import getRecordInstanceStatus from "./getRecordInstanceStatus";

import { createCertbotDebug } from "../../utils/createDebug";
import { DeploymentError } from "../../utils/errors";

import { RecordInstaceStatus } from "../../types/custom";

export default async function runCertbot(
  instanceId: string,
  recordId: string,
  subdomain: string,
  ms = 2000,
  triesLeft = 50,
) {
  const debug = createCertbotDebug(Config.CLIENT_OPTIONS.debug);
  const defaultTriesLeft = triesLeft;

  return new Promise<RecordInstaceStatus>((resolve, reject) => {
    const recordStatusInterval = setInterval(async () => {
      const recordInstaceStatus = await getRecordInstanceStatus(
        instanceId,
        recordId,
        subdomain,
      );
      const { recordStatus, instanceState } = recordInstaceStatus;

      const runCertbotCommandsDelay = async (ms: number) => {
        return new Promise<void>(resolve =>
          setTimeout(
            () => resolve(runCertbotCommands(instanceId, subdomain)),
            ms,
          ),
        );
      };

      if (
        recordStatus === "INSYNC" &&
        instanceState === InstanceStateName.running
      ) {
        clearInterval(recordStatusInterval);
        await runCertbotCommandsDelay(120000);

        resolve(recordInstaceStatus);
      } else if (triesLeft <= 1) {
        clearInterval(recordStatusInterval);
        debug(
          `Error: 'recordStatusInterval' attempted more than ${defaultTriesLeft} times, but didn't work as expected`,
        );

        reject(
          new DeploymentError({
            code: "runCertbot_recordStatusInterval",
            message: `'recordStatusInterval' attempted more than ${defaultTriesLeft} times, but didn't work as expected`,
          }),
        );
      }

      triesLeft--;
    }, ms);
  });
}
