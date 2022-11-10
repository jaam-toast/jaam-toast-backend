import { Route53, RRType } from "@aws-sdk/client-route-53";

const REGION = "ap-northeast-2";
const HOSTED_ZONE_ID = "Z089613026ALLZGGIJMNI";

const client = new Route53({ region: REGION });

interface CreateDNSRecordProps {
  name: string;
  value: string;
  type: RRType;
}

export const createDNSRecord = async ({
  name,
  value,
  type = RRType.A,
}: CreateDNSRecordProps) => {
  try {
    const result = await client.changeResourceRecordSets({
      HostedZoneId: HOSTED_ZONE_ID,
      ChangeBatch: {
        Changes: [
          {
            Action: "UPSERT",
            ResourceRecordSet: {
              Name: name, // ex. "example.jaamtoast.com"
              Type: type, // ex. "A"
              ResourceRecords: [{ Value: value }], // ex. "1.1.1.1"
            },
          },
        ],
      },
    });
  } catch (e) {
    console.error(e);
  }
};
