import { CloudFlare } from "../../infrastructure/cloudFlare";
import { BUILD_MESSAGE } from "../../@config/constants";

export async function deleteBuildProject({
  projectName,
}: {
  projectName: string;
}) {
  try {
    const cloudFlareApi = new CloudFlare();
    const { result } = await cloudFlareApi.getProject({ projectName });

    if (!result) {
      throw Error(BUILD_MESSAGE.DELETE_ERROR.INVALID_PROJECT_NAME);
    }

    if (result.domains.length > 1) {
      const { success: isSuccessRemoveDomain } =
        await cloudFlareApi.removeDomain({
          projectName,
          domain: result.domains[1],
        });

      if (!isSuccessRemoveDomain) {
        throw Error(BUILD_MESSAGE.DELETE_ERROR.FAIL_TO_DELETE_DOMAIN);
      }
    }

    const { success: isSuccessDeleteProject } =
      await cloudFlareApi.deleteProject({ projectName });

    return isSuccessDeleteProject;
  } catch (error) {
    throw error;
  }
}
