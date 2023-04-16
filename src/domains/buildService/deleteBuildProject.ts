import { CloudFlare } from "../../infrastructure/cloudFlare";
import { Logger as log } from "../../util/Logger";

type Options = {
  projectName: string;
};

export async function deleteBuildProject({ projectName }: Options) {
  const cloudFlareApi = new CloudFlare();

  //TODO
  const project = await cloudFlareApi.getProject({ projectName });

  /**
   * return format
   * { result: null, success: true, errors: [], messages: [] }
   */

  // TODO
  const { success: isSuccessRemoveDomain } = await cloudFlareApi.removeDomain({
    projectName,
    domain: project.domain,
  });

  if (!isSuccessRemoveDomain) {
    throw Error("Fail to remove project domain");
  }

  const { success: isSuccessDeleteProject } = await cloudFlareApi.deleteProject(
    { projectName },
  );

  if (!isSuccessDeleteProject) {
    throw Error("Fail to delete project");
  }
}
