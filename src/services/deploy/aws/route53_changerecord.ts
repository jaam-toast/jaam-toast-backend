import {
  ChangeResourceRecordSetsCommand,
  RRType,
} from "@aws-sdk/client-route-53";

import Config from "../../../config";
import route53Client from "./libs/route53Client";

import { DeploymentError } from "../../../utils/errors";
import { createDeploymentDebug } from "../../../utils/createDebug";

import { ChangeDNSRecordProps } from "../../../types/custom";
import terminateInstance from "./ec2_terminateinstances";

const changeDNSRecord = async ({
  actionType,
  subdomain,
  recordValue,
  recordType = RRType.A,
  instanceId,
}: ChangeDNSRecordProps) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const recordName = `${subdomain}.${Config.SERVER_URL}`;

  const recordParams = {
    HostedZoneId: Config.HOSTED_ZONE_ID,
    ChangeBatch: {
      Comment: `${actionType} a record A`,
      Changes: [
        {
          Action: `${actionType}`,
          ResourceRecordSet: {
            Name: recordName,
            Type: recordType,
            TTL: 300,
            ResourceRecords: [{ Value: recordValue }],
          },
        },
      ],
    },
  };

  try {
    const command = new ChangeResourceRecordSetsCommand(recordParams);

    const data = await route53Client.send(command);

    if (data.ChangeInfo) {
      const { Id, Status, SubmittedAt } = data.ChangeInfo;

      const recordChangeInfo = {
        recordId: Id?.split("/change/")[1],
        recordStatus: Status,
        recordCreatedAt: SubmittedAt,
      };

      return recordChangeInfo;
    }
  } catch (err) {
    debug(
      `Error: An unexpected error occurred during ChangeResourceRecordSetsCommand_${actionType} - ${err}`,
    );

    await terminateInstance(instanceId as string);

    throw new DeploymentError({
      code: `route53Client_ChangeResourceRecordSetsCommand_${actionType}`,
      message: `ChangeResourceRecordSetsCommand_${actionType} didn't work as expected`,
    });
  }
};

export default changeDNSRecord;
