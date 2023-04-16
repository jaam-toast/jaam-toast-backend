import { Route53 } from "../../infrastructure/aws";
import { Logger as log } from "../../util/Logger";
import Config from "../../config";

export async function createDomain({ subdomain }: any) {
  const route53 = new Route53();
  const recordChangeInfo = await route53.createARecord({
    recordName: `${subdomain}.${Config.SERVER_URL}`,
  });

  if (!recordChangeInfo?.recordId) {
    throw Error("Cannot find record id after creating DNS Record.");
  }

  const domainCreationResult = await route53.waitForRecordCreation({
    recordId: recordChangeInfo.recordId,
    limitWait: 120000,
  });

  if (domainCreationResult === "FAIL") {
    throw Error(
      "An unexpected error occurred while waiting for domain creation.",
    );
  }

  log.build("record is ready.");

  return `${subdomain}.jaamtoast.click`;
}
