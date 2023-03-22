import Project from "@src/models/Project";
import Deployment from "@src/models/Deployment";
import { BuildOptions } from "@src/types";
import { IdParameter, ProjectProperty } from "@src/types/db";

class ProjectModel {
  static async create(data: BuildOptions) {
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

  static async findByIdAndUpdate(id: IdParameter, data: ProjectProperty) {
    const updatedProject = await Project.updateOne(
      { _id: id },
      { $set: { ...data } },
    );

    return updatedProject;
  }

  static async findByIdAndUpdateDeployment(
    projectId: IdParameter,
    deploymentId: IdParameter,
  ) {
    if (!projectId || !deploymentId) {
      throw Error("Expected 2 arguments, but insufficient arguments.");
    }

    const updatedProject = await Project.updateOne(
      { _id: projectId },
      { $push: { deployments: deploymentId } },
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
}

export default ProjectModel;
