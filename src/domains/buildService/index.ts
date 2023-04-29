import { injectable } from "inversify";

import { connectDomain } from "./connectDomain";
import { createBuildProject } from "./createBuildProject";
import { createBuildResource } from "./createBuildResource";
import { deleteBuildProject } from "./deleteBuildProject";
import { Logger as log } from "../../utils/Logger";
import Config from "../../config";
import { BUILD_MESSAGE } from "../../config/constants";

import type { Project } from "../../types/project";

@injectable()
export class BuildService {
  async createBuild(options: Project) {
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
        throw Error(BUILD_MESSAGE.CREATE_ERROR.ENVIRONMENT_DATA_NOT_FOUND);
      }

      const buildResourceLocation = await createBuildResource({
        repoName,
        repoCloneUrl,
        framework,
        installCommand,
        buildCommand,
      });

      if (!buildResourceLocation) {
        throw Error(BUILD_MESSAGE.CREATE_ERROR.FAIL_RESOURCE_CREATION);
      }

      const buildOriginalDomain = await createBuildProject({
        buildResourceLocation,
        projectName,
      });

      if (!buildOriginalDomain) {
        throw Error(BUILD_MESSAGE.CREATE_ERROR.DOMAIN_CREATE_FAIL);
      }

      const buildDomain = await connectDomain({
        projectName,
        changeDomain: `${projectName}.${Config.SERVER_URL}`,
        originalDomain: buildOriginalDomain,
      });

      if (!buildDomain) {
        throw Error(BUILD_MESSAGE.CREATE_ERROR.DOMAIN_CREATE_FAIL);
      }

      log.build(
        `${BUILD_MESSAGE.CREATE.COMPLETE}-
        ${JSON.stringify({
          buildOriginalDomain,
        })}`,
      );
      return { buildDomain, buildOriginalDomain };
    } catch (error) {
      log.buildError(BUILD_MESSAGE.CREATE_ERROR.UNEXPECTED_DURING_BUILD);

      throw error;
    }
  }

  async updateBuild() {}

  async deleteBuild({ projectName }: { projectName: string }) {
    try {
      if (!projectName) {
        throw Error(BUILD_MESSAGE.DELETE_ERROR.ENVIRONMENT_DATA_NOT_FOUND);
      }

      const result = await deleteBuildProject({
        projectName,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }
}
