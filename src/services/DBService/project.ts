import Project from "@src/models/Project";
import Deployment from "@src/models/Deployment";
import { BuildOptions } from "@src/types";
import { IdParameter, ProjectOptions } from "@src/types/db";

class ProjectService {
  static async create(options: BuildOptions) {
    try {
      if (!options) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const {
        space,
        repoName,
        repoCloneUrl,
        projectName,
        nodeVersion,
        installCommand,
        buildCommand,
        buildType,
        envList,
      } = options;

      if (
        !space ||
        !repoName ||
        !repoCloneUrl ||
        !projectName ||
        !nodeVersion ||
        !installCommand ||
        !buildCommand ||
        !buildType ||
        !envList
      ) {
        throw Error("Cannot find environment options before saving project.");
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

      const project = await Project.findOne({ ...options });

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
        { $set: { ...options } },
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

      const updatedProject = await Project.updateOne(
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

      const deletedProject = await Project.findOneAndDelete({
        ...targetOptions,
      });

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
