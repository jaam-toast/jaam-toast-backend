import Project from "@src/models/Project";
import Deployment from "@src/models/Deployment";
import { BuildOptions } from "@src/types";
import { IdParameter, ProjectProperty } from "@src/types/db";

class ProjectModel {
  static async create(data: BuildOptions) {
    if (!data) {
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
    } = data;

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
    });

    return newProject;
  }

  static async findById(id: IdParameter) {
    if (!id) {
      throw Error("Expected 1 arguments, but insufficient arguments.");
    }

    const project = await Project.findById(id);

    return project;
  }

  static async findOne(targetData: ProjectProperty) {
    if (!targetData) {
      throw Error("Expected 1 arguments, but insufficient arguments.");
    }

    const project = await Project.findOne({ ...targetData });

    return project;
  }

  static async findByIdAndUpdate(id: IdParameter, updateData: ProjectProperty) {
    if (!id || !updateData) {
      throw Error("Expected 2 arguments, but insufficient arguments.");
    }

    const updatedProject = await Project.updateOne(
      { _id: id },
      { $set: { ...updateData } },
    );

    return updatedProject;
  }

  static async findOneAndUpdate(
    targetData: ProjectProperty,
    updateData: ProjectProperty,
  ) {
    if (!targetData || !updateData) {
      throw Error("Expected 2 arguments, but insufficient arguments.");
    }

    if (!Object.keys(updateData).length) {
      throw Error("Update data type is not valid");
    }

    const updatedProject = await Project.updateOne(
      { ...targetData },
      { $set: { ...updateData } },
    );

    return updatedProject;
  }

  static async findByIdAndDelete(id: IdParameter) {
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
  }

  static async findOneAndDelete(targetData: ProjectProperty) {
    if (!targetData) {
      throw Error("Expected 1 arguments, but insufficient arguments.");
    }

    const deletedProject = await Project.findOneAndDelete({ ...targetData });

    if (!deletedProject) return;

    await Deployment.deleteMany({
      _id: {
        $in: deletedProject.deployments,
      },
    });

    return deletedProject;
  }
}

export default ProjectModel;
