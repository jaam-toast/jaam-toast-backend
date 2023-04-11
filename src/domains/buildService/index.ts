import { createBuild } from "./createBuild";
import { makeBuildResource } from "./makeBuildResource";

import type { OptionalProject } from "@src/domains/types/entity";

// type 정리중..
type Options = {
  repoName: string;
  repoCloneUrl: string;
  projectName: string;
  framework: string;
  installCommand: string;
  buildCommand: string;
  envList: string;
};

export class BuildService {
  static async createBuild(options: Options) {
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
        throw Error("Cannot find environment data before create project.");
      }

      const buildResourceLocation = await makeBuildResource({
        repoName,
        repoCloneUrl,
        framework,
        installCommand,
        buildCommand,
      });

      if (!buildResourceLocation) {
        throw Error("Cannot find build Resource");
      }

      const buildUrl = await createBuild({
        buildResourceLocation,
        projectName,
      });

      if (!buildUrl) {
        throw Error("An unexpected error occurred during build project");
      }

      return buildUrl;
    } catch (error) {
      throw error;
    }
  }

  async readBuild() {}

  async updateBuild(options: OptionalProject) {}

  async deleteBuild(id: string) {}
}
