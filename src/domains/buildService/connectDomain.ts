import { CloudFlare } from "../../infrastructure/cloudFlare";
import { Route53 } from "../../infrastructure/aws";
import { BUILD_MESSAGE } from "../../config/constants";

type Options = {
  projectName: string;
  changeDomain: string;
  originalDomain: string;
};

export async function connectDomain({
  projectName,
  changeDomain,
  originalDomain,
}: Options) {
  try {
    const route53 = new Route53();
    const recordChangeInfo = await route53.createCnameRecord({
      recordName: changeDomain,
      recordValue: originalDomain,
    });

    if (!recordChangeInfo?.recordId) {
      throw Error(BUILD_MESSAGE.CREATE_ERROR.RECORD_NOT_FOUND);
    }

    const domainCreationResult = await route53.waitForRecordCreation({
      recordId: recordChangeInfo.recordId,
      limitWait: 120000,
    });

    if (domainCreationResult === "FAIL") {
      throw Error(BUILD_MESSAGE.CREATE_ERROR.RECORD_NOT_FOUND);
    }

    const cloudFlareApi = new CloudFlare();
    const { result: resultAddDomain } = await cloudFlareApi.addDomain({
      projectName: projectName,
      changeDomain: changeDomain,
    });

    if (resultAddDomain.success === false) {
      throw Error(BUILD_MESSAGE.CREATE_ERROR.FAIL_DOMAIN_CONNECTION);
    }

    return changeDomain;
  } catch (error) {
    throw error;
  }
}
