import { injectable } from "inversify";

import { connectDomain } from "./connectDomain";
import { createBuildProject } from "./createBuildProject";
import { createBuildResource } from "./createBuildResource";
import { deleteBuildProject } from "./deleteBuildProject";
import { Logger as log } from "../../util/Logger";
import Config from "../../config";
import { BUILD_MESSAGE } from "../../config/constants";

import type { BaseProject } from "../@types/entity";
import { ClientFrameworkInput } from "../@types";

interface IBuildService {
  createBuild(options: BaseProject): Promise<{
    buildDomain: string;
    buildOriginalDomain: string;
  }>;
  updateBuild(): Promise<void>;
  deleteBuild({ projectName }): Promise<void>;
}

@injectable()
export class BuildService implements IBuildService {
  async createBuild(options: BaseProject) {
    try {
      const {
        repoName,
        repoCloneUrl,
        projectName,
        framework,
        installCommand,
        buildCommand,
        envList,
      } = options;

      if (
        !repoName ||
        !repoCloneUrl ||
        !projectName ||
        !framework ||
        !installCommand ||
        !buildCommand ||
        !envList
      ) {
        throw new Error(BUILD_MESSAGE.ERROR.ENVIRONMENT_DATA_NOT_FOUND);
      }

      const buildResourceLocation = await createBuildResource({
        repoName,
        repoCloneUrl,
        framework: ClientFrameworkInput[framework],
        installCommand,
        buildCommand,
      });

      if (!buildResourceLocation) {
        throw new Error(BUILD_MESSAGE.ERROR.FAIL_RESOURCE_CREATION);
      }

      const buildOriginalDomain = await createBuildProject({
        buildResourceLocation,
        projectName,
      });

      if (!buildOriginalDomain) {
        throw new Error(BUILD_MESSAGE.ERROR.DOMAIN_CREATE_FAIL);
      }

      const buildDomain = await connectDomain({
        projectName,
        changeDomain: `${projectName}.${Config.SERVER_URL}`,
        originalDomain: buildOriginalDomain,
      });

      if (!buildDomain) {
        throw new Error(BUILD_MESSAGE.ERROR.DOMAIN_CREATE_FAIL);
      }

      log.build(BUILD_MESSAGE.COMPLETE);

      return { buildDomain, buildOriginalDomain };
    } catch (error) {
      log.buildError(BUILD_MESSAGE.ERROR.UNEXPECTED_DURING_BUILD);

      throw error;
    }
  }

  async updateBuild() {}

  async deleteBuild({ projectName }) {
    if (!projectName) {
      throw Error("Cannot find environment data before delete project.");
    }

    await deleteBuildProject({
      projectName,
    });
  }
}
