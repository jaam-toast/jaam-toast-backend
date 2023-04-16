import { CloudFlare } from "../../infrastructure/cloudFlare";
import { Route53 } from "../../infrastructure/aws";

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

    const cloudFlareApi = new CloudFlare();
    const { result: resultAddDomain } = await cloudFlareApi.addDomain({
      projectName: projectName,
      changeDomain: changeDomain,
    });

    if (resultAddDomain.success === false) {
      throw Error("Project creation failed.");
    }

    return changeDomain;
  } catch (error) {
    console.log("createDomain", error);
  }
}
