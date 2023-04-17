import { Route53 } from "../../infrastructure/aws";
import { Logger as log } from "../../utils/Logger";
import Config from "../../config";
import { CMS_MESSAGE } from "../../config/constants";

export async function createDomain({ subdomain }: any): Promise<string> {
  const route53 = new Route53();
  const recordChangeInfo = await route53.createARecord({
    recordName: `${subdomain}.${Config.SERVER_URL}`,
  });

  if (!recordChangeInfo?.recordId) {
    throw Error(CMS_MESSAGE.CREATE_ERROR.RECORD_NOT_FOUND);
  }

  const domainCreationResult = await route53.waitForRecordCreation({
    recordId: recordChangeInfo.recordId,
    limitWait: 120000,
  });

  if (domainCreationResult === "FAIL") {
    throw Error(CMS_MESSAGE.CREATE_ERROR.UNEXPECTED_DURING_DOMAIN_CREATION);
  }

  log.build("record is ready.");

  return `${subdomain}.jaamtoast.click`;
}
