import { Route53 } from "../../infrastructure/aws";

export async function createValidDomain(domain: string) {
  const route53 = new Route53();

  let startRecordName: string = '""';
  let duplicateRecord: string | undefined;

  while (!startRecordName || duplicateRecord) {
    const { IsTruncated, ResourceRecordSets, NextRecordName } =
      await route53.getARecordSets({
        startRecordName,
      });

    const duplicateRecord = ResourceRecordSets?.find(
      record => record.Name === domain,
    );

    if (duplicateRecord || !IsTruncated || !NextRecordName) {
      break;
    }

    startRecordName = NextRecordName;
  }
}
