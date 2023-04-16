import { CloudFlare } from "../../infrastructure/cloudFlare";
import { Logger as log } from "../../util/Logger";

type Options = {
  projectName: string;
};

export async function deleteBuildProject({ projectName }: Options) {
  try {
    const cloudFlareApi = new CloudFlare();
    const { result } = await cloudFlareApi.getProject({ projectName });

    if (!result) {
      throw Error("The project name is invalid.");
    }

    if (result.domains.length > 1) {
      const { success: isSuccessRemoveDomain } =
        await cloudFlareApi.removeDomain({
          projectName,
          domain: result.domains[1],
        });

      if (!isSuccessRemoveDomain) {
        throw Error("Fail to remove project domain");
      }
    }

    const { success: isSuccessDeleteProject } =
      await cloudFlareApi.deleteProject({ projectName });

    return isSuccessDeleteProject;
  } catch (error) {
    throw error;
  }
}
