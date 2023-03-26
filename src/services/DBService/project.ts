import Project from "@src/models/Project";
import Deployment from "@src/models/Deployment";

import type {
  Project as ProjectType,
  ProjectOptions,
  IdParameter,
} from "@src/types/db";

class ProjectService {
  static async create(data: ProjectType) {
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
        nodeVersion,
        installCommand,
        buildCommand,
        buildType,
        envList,
        webhookId,
        lastCommitMessage,
        lastCommitHash,
      } = data;

      if (
        !space ||
        !repoName ||
        !repoCloneUrl ||
        !projectName ||
        !projectUpdatedAt ||
        !nodeVersion ||
        !installCommand ||
        !buildCommand ||
        !buildType ||
        !envList ||
        !webhookId ||
        !lastCommitMessage ||
        !lastCommitHash
      ) {
        throw Error("Cannot find environment data before saving project.");
      }

      const newProject = await Project.create({
        space,
        repoName,
        repoCloneUrl,
        projectName,
        nodeVersion,
        installCommand,
        buildCommand,
        buildType,
        envList,
        webhookId,
        lastCommitMessage,
        lastCommitHash,
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

  static async findOne(options: ProjectOptions) {
    try {
      if (!options) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const project = await Project.findOne(options);

      return project;
    } catch (error) {
      throw error;
    }
  }

  static async findByIdAndUpdate(id: IdParameter, options: ProjectOptions) {
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

  static async findOneAndUpdate(
    targetOptions: ProjectOptions,
    updateOptions: ProjectOptions,
  ) {
    try {
      if (!targetOptions || !updateOptions) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      if (!Object.keys(updateOptions).length) {
        throw Error("Update data type is not valid");
      }

      const updatedProject = updateOptions.deployments
        ? await Project.findOneAndUpdate(
            { ...targetOptions },
            { $set: { ...updateOptions } },
            { $push: { deployments: updateOptions.deployments[0] } },
          )
        : await Project.findOneAndUpdate(
            { ...targetOptions },
            { $set: { ...updateOptions } },
          );

      return updatedProject;
    } catch (error) {
      throw error;
    }
  }

  static async findByIdAndDelete(id: IdParameter) {
    try {
      if (!id) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const deletedProject = await Project.findByIdAndDelete(id);

      if (!deletedProject) return;

      await Deployment.deleteMany({
        _id: {
          $in: deletedProject.deployments,
        },
      });

      return deletedProject;
    } catch (error) {
      throw error;
    }
  }

  static async findOneAndDelete(targetOptions: ProjectOptions) {
    try {
      if (!targetOptions) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const deletedProject = await Project.findOneAndDelete(targetOptions);

      if (!deletedProject) return;

      await Deployment.deleteMany({
        _id: {
          $in: deletedProject.deployments,
        },
      });

      return deletedProject;
    } catch (error) {
      throw error;
    }
  }
}

export default ProjectService;
