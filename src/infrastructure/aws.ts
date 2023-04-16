import {
  Route53Client,
  RRType,
  ChangeResourceRecordSetsCommand,
  GetChangeCommand,
  ListResourceRecordSetsCommand,
} from "@aws-sdk/client-route-53";

import Config from "./@config";
import { Logger as log } from "src/util/Logger";

export class Route53 {
  client = new Route53Client({
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  });

  async getARecordSets({ startRecordName }: { startRecordName?: string }) {
    try {
      const params = {
        HostedZoneId: Config.AWS_HOSTED_ZONE_ID,
        StartRecordName: startRecordName,
        StartRecordType: "A",
      };

      const command = new ListResourceRecordSetsCommand(params);
      const data = await this.client.send(command);

      return data;
    } catch (error) {
      throw error;
    }
  }

  async createARecord({ recordName }: any) {
    try {
      const changeRecordOptions = {
        HostedZoneId: Config.AWS_HOSTED_ZONE_ID,
        ChangeBatch: {
          Comment: `Create a record A`,
          Changes: [
            {
              Action: "CREATE",
              ResourceRecordSet: {
                AliasTarget: {
                  DNSName: Config.AWS_JAAM_SERVER_DNS_NAME,
                  EvaluateTargetHealth: false,
                  HostedZoneId: Config.AWS_DNS_HOSTED_ZONE_ID,
                },
                Name: recordName,
                Type: RRType.A,
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
        throw new Error("Failed to create record");
      }

      const { Id, Status, SubmittedAt } = data.ChangeInfo;

      return {
        recordId: Id.split("/change/")[1],
        recordStatus: Status,
        recordCreatedAt: SubmittedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  async createCnameRecord({ recordName, recordValue }: any) {
    try {
      const changeRecordOptions = {
        HostedZoneId: Config.AWS_HOSTED_ZONE_ID,
        ChangeBatch: {
          Comment: `Create a record CNAME`,
          Changes: [
            {
              Action: "CREATE",
              ResourceRecordSet: {
                Name: recordName,
                Type: RRType.CNAME,
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
        throw new Error("Failed to create record");
      }

      const { Id, Status, SubmittedAt } = data.ChangeInfo;

      return {
        recordId: Id.split("/change/")[1],
        recordStatus: Status,
        recordCreatedAt: SubmittedAt,
      };
    } catch (error) {
      log.serverError(
        "Error occurred during the Route53 create CNAME repcord operation",
      );
      throw error;
    }
  }

  async deleteARecord(recordName: string) {
    try {
      const deleteRecordOptions = {
        HostedZoneId: Config.AWS_HOSTED_ZONE_ID,
        ChangeBatch: {
          Comment: `Delete a record A`,
          Changes: [
            {
              Action: "DELETE",
              ResourceRecordSet: {
                AliasTarget: {
                  DNSName: Config.AWS_JAAM_SERVER_DNS_NAME,
                  EvaluateTargetHealth: false,
                  HostedZoneId: Config.AWS_DNS_HOSTED_ZONE_ID,
                },
                Name: recordName,
                Type: RRType.A,
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
        throw new Error(
          "Cannot find the data required to create a DNS record.",
        );
      }

      const { Id, Status, SubmittedAt } = data.ChangeInfo;

      return {
        recordId: Id.split("/change/")[1],
        recordStatus: Status,
        recordCreatedAt: SubmittedAt,
      };
    } catch (error) {
      log.serverError(
        "Error occurred during the Route53 delete record operation",
      );
      throw error;
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
      log.serverError(
        "Error occurred during the Route53 get record status operation",
      );
      throw error;
    }
  }

  async waitForRecordCreation({ recordId, limitWait }: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        clearInterval(interval);
        clearTimeout(timeout);

        resolve("FAIL");
      }, limitWait);

      const interval = setInterval(async () => {
        try {
          const recordStatus = await this.getStatus(recordId);

          if (recordStatus === "INSYNC") {
            clearInterval(interval);
            clearTimeout(timeout);

            resolve("SUCCESS");
          }
        } catch (error) {
          log.serverError("Error occurred during the wait record creation");
          reject(error);
        }
      }, 2000);
    });
  }
}
