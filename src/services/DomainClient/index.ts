import {
  Route53Client,
  RRType,
  ChangeResourceRecordSetsCommand,
  GetChangeCommand,
} from "@aws-sdk/client-route-53";

import Config from "../../config";

class DomainClient {
  client = new Route53Client({
    credentials: {
      accessKeyId: Config.ACCESS_KEY_ID,
      secretAccessKey: Config.SECRET_ACCESS_KEY,
    },
    region: Config.INSTANCE_REGION,
  });

  async createARecord(recordName: string, recordValue: string) {
    try {
      const changeRecordOptions = {
        HostedZoneId: Config.HOSTED_ZONE_ID,
        ChangeBatch: {
          Comment: `Create a record A`,
          Changes: [
            {
              Action: "CREATE",
              ResourceRecordSet: {
                Name: recordName,
                Type: RRType.A,
                TTL: 300,
                ResourceRecords: [{ Value: recordValue }],
              },
            },
          ],
        },
      };
      const command = new ChangeResourceRecordSetsCommand(changeRecordOptions);
      const data = await this.client.send(command);

      if (
        !data.ChangeInfo?.Id ||
        !data.ChangeInfo?.Status ||
        !data.ChangeInfo?.SubmittedAt
      ) {
        throw new Error();
      }

      const { Id, Status, SubmittedAt } = data.ChangeInfo;
      const recordCreationInfo = {
        recordId: Id.split("/change/")[1],
        recordStatus: Status,
        recordCreatedAt: SubmittedAt,
      };

      return recordCreationInfo;
    } catch (error) {
      throw new Error(
        "Error: Run failed by creating project DNS A Record commands to AWS Route53 Client.",
      );
    }
  }

  async removeARecord(recordName: string, recordValue: string) {
    try {
      const deleteRecordOptions = {
        HostedZoneId: Config.HOSTED_ZONE_ID,
        ChangeBatch: {
          Comment: `Delete a record A`,
          Changes: [
            {
              Action: "DELETE",
              ResourceRecordSet: {
                Name: recordName,
                Type: RRType.A,
                TTL: 300,
                ResourceRecords: [{ Value: recordValue }],
              },
            },
          ],
        },
      };
      const command = new ChangeResourceRecordSetsCommand(deleteRecordOptions);
      const data = await this.client.send(command);

      if (
        !data.ChangeInfo?.Id ||
        !data.ChangeInfo?.Status ||
        !data.ChangeInfo?.SubmittedAt
      ) {
        throw new Error();
      }

      const { Id, Status, SubmittedAt } = data.ChangeInfo;
      const recordCreationInfo = {
        recordId: Id.split("/change/")[1],
        recordStatus: Status,
        recordCreatedAt: SubmittedAt,
      };

      return recordCreationInfo;
    } catch (error) {
      throw new Error(
        "Error: Run failed by removing project DNS A Record commands to AWS Route53 Client.",
      );
    }
  }

  async getStatus(id: string) {
    try {
      const getChangeParams = { Id: id };
      const command = new GetChangeCommand(getChangeParams);
      const data = await this.client.send(command);
      const recordStatus = data?.ChangeInfo?.Status;

      return recordStatus;
    } catch (error) {
      throw new Error(
        "Error: Run failed by sending describe domain state commands to AWS Route53 Client.",
      );
    }
  }
}

export default DomainClient;
