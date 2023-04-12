import Project from "../repositories/models/Project";
import { BaseProject, OptionalProject } from "../types/entity";

import type { Project as ProjectType, IdParameter } from "../../types/db";

export type Env = {
  key: string;
  value: string;
};

export class ProjectRepository {
  space?: string;
  repoName?: string;
  repoCloneUrl?: string;
  projectName?: string;
  projectUpdatedAt?: string;

  framework?: string;
  installCommand?: string;
  buildCommand?: string;
  envList?: Env[];

  buildUrl?: string;
  cmsUrl?: string;
  schemaList?: string[];
  contentList?: string[];
  assetStorageUrl?: string;

  webhookId?: number;
  lastCommitMessage?: string;
  lastCommitHash?: string;

  status?: string;

  static async create(data: BaseProject) {
    try {
      if (!data) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const {
        space,
        repoName,
        repoCloneUrl,
        projectName,
        projectUpdatedAt,
        framework,
        installCommand,
        buildCommand,
        envList,
      } = data;

      if (
        !space ||
        !repoName ||
        !repoCloneUrl ||
        !projectName ||
        !projectUpdatedAt ||
        !framework ||
        !installCommand ||
        !buildCommand ||
        !envList
      ) {
        throw Error("Cannot find environment data before create project.");
      }

      const newProject = await Project.create({
        space,
        repoName,
        repoCloneUrl,
        projectName,
        projectUpdatedAt,
        framework,
        installCommand,
        buildCommand,
        envList,
      });

      return newProject;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id: IdParameter) {
    try {
      if (!id) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const project = await Project.findById(id);

      return project;
    } catch (error) {
      throw error;
    }
  }

  // static async findOne(options: ProjectOptions) {
  //   try {
  //     if (!options) {
  //       throw Error("Expected 1 arguments, but insufficient arguments.");
  //     }

  //     const project = await Project.findOne(options);

  //     return project;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  static async findByIdAndUpdate(id: IdParameter, options: OptionalProject) {
    try {
      if (!id || !options) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      const updatedProject = await Project.updateOne(
        { _id: id },
        { $set: options },
      );

      return updatedProject;
    } catch (error) {
      throw error;
    }
  }

  // static async findOneAndUpdate(
  //   targetOptions: ProjectOptions,
  //   updateOptions: ProjectOptions,
  // ) {
  //   try {
  //     if (!targetOptions || !updateOptions) {
  //       throw Error("Expected 2 arguments, but insufficient arguments.");
  //     }

  //     if (!Object.keys(updateOptions).length) {
  //       throw Error("Update data type is not valid");
  //     }

  //     const { deployments } = updateOptions;
  //     delete updateOptions.deployments;

  //     const updatedProject = deployments
  //       ? await Project.findOneAndUpdate(
  //           { ...targetOptions },
  //           { $set: updateOptions, $push: { deployments: deployments[0] } },
  //         )
  //       : await Project.findOneAndUpdate(
  //           { ...targetOptions },
  //           { $set: updateOptions },
  //         );

  //     return updatedProject;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // static async findByIdAndDelete(id: IdParameter) {
  //   try {
  //     if (!id) {
  //       throw Error("Expected 1 arguments, but insufficient arguments.");
  //     }

  //     const deletedProject = await Project.findByIdAndDelete(id);

  //     if (!deletedProject) return;

  //     await Deployment.deleteMany({
  //       _id: {
  //         $in: deletedProject.deployments,
  //       },
  //     });

  //     return deletedProject;
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // static async findOneAndDelete(targetOptions: ProjectOptions) {
  //   try {
  //     if (!targetOptions) {
  //       throw Error("Expected 1 arguments, but insufficient arguments.");
  //     }

  //     const deletedProject = await Project.findOneAndDelete(targetOptions);

  //     if (!deletedProject) return;

  //     await Deployment.deleteMany({
  //       _id: {
  //         $in: deletedProject.deployments,
  //       },
  //     });

  //     return deletedProject;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
