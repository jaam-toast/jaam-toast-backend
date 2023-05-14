import { injectable } from "inversify";
import {
  Route53Client,
  RRType,
  ChangeResourceRecordSetsCommand,
  GetChangeCommand,
} from "@aws-sdk/client-route-53";

import Config from "./@config";

import type { RecordClient } from "../@config/di.config";

@injectable()
export class Route53RecordClient implements RecordClient {
  private client = new Route53Client({
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  });

  async createARecord({
    recordName,
    recordTarget,
  }: {
    recordName: string;
    recordTarget: string;
  }) {
    try {
      const createARecordCommand = new ChangeResourceRecordSetsCommand({
        HostedZoneId: Config.AWS_HOSTED_ZONE_ID,
        ChangeBatch: {
          Comment: `Create a record A`,
          Changes: [
            {
              Action: "CREATE",
              ResourceRecordSet: {
                AliasTarget: {
                  DNSName: recordTarget,
                  EvaluateTargetHealth: false,
                  HostedZoneId: Config.AWS_CLOUDFRONT_HOSTED_ZONE_ID,
                },
                Name: recordName,
                Type: RRType.A,
              },
            },
          ],
        },
      });
      const { ChangeInfo } = await this.client.send(createARecordCommand);

      if (!ChangeInfo?.Id) {
        throw new Error("Failed to create record");
      }

      const recordId = ChangeInfo.Id.split("/change/")[1];

      return recordId;
    } catch (error) {
      throw error;
    }
  }

  async deleteARecord({
    recordName,
    recordTarget,
  }: {
    recordName: string;
    recordTarget: string;
  }) {
    try {
      const deleteARecordCommand = new ChangeResourceRecordSetsCommand({
        HostedZoneId: Config.AWS_HOSTED_ZONE_ID,
        ChangeBatch: {
          Comment: `Delete a record A`,
          Changes: [
            {
              Action: "DELETE",
              ResourceRecordSet: {
                AliasTarget: {
                  DNSName: recordTarget,
                  EvaluateTargetHealth: false,
                  HostedZoneId: Config.AWS_DNS_HOSTED_ZONE_ID,
                },
                Name: recordName,
                Type: RRType.A,
              },
            },
          ],
        },
      });
      const deleteARecordResult = await this.client.send(deleteARecordCommand);

      if (!deleteARecordResult.ChangeInfo) {
        throw new Error(
          "Cannot find the data required to create a DNS record.",
        );
      }
    } catch (error) {
      throw error;
    }
  }

  async createCNAME({
    recordName,
    recordTarget,
  }: {
    recordName: string;
    recordTarget: string;
  }) {
    try {
      const createCNAMECommand = new ChangeResourceRecordSetsCommand({
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
                ResourceRecords: [{ Value: recordTarget }],
              },
            },
          ],
        },
      });
      const { ChangeInfo } = await this.client.send(createCNAMECommand);

      if (!ChangeInfo?.Id) {
        throw new Error("Failed to create record");
      }

      const recordId = ChangeInfo.Id.split("/change/")[1];

      return recordId;
    } catch (error) {
      throw error;
    }
  }

  async deleteCNAME({
    recordName,
    recordTarget,
  }: {
    recordName: string;
    recordTarget: string;
  }) {
    try {
      const deleteCNAMECommand = new ChangeResourceRecordSetsCommand({
        HostedZoneId: Config.AWS_HOSTED_ZONE_ID,
        ChangeBatch: {
          Comment: `Delete a record CNAME`,
          Changes: [
            {
              Action: "DELETE",
              ResourceRecordSet: {
                Name: recordName,
                Type: RRType.CNAME,
                TTL: 300,
                ResourceRecords: [{ Value: recordTarget }],
              },
            },
          ],
        },
      });
      const { ChangeInfo } = await this.client.send(deleteCNAMECommand);

      if (!ChangeInfo?.Id) {
        throw new Error("Failed to delete record");
      }
    } catch (error) {
      throw error;
    }
  }

  async getRecordStatus({ recordId }: { recordId: string }) {
    try {
      const getRecordStatusCommand = new GetChangeCommand({ Id: recordId });
      const getRecordStatusResult = await this.client.send(
        getRecordStatusCommand,
      );
      const recordStatus = getRecordStatusResult.ChangeInfo?.Status;

      return recordStatus === "INSYNC";
    } catch {
      return false;
    }
  }
}
