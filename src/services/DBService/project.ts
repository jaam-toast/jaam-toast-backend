import Project from "@src/models/Project";
import Deployment from "@src/models/Deployment";
import {
  BuildOptions,
  Project as ProjectType,
  MongoDbId,
} from "@src/types/index";

type Id = MongoDbId | string;

type Property = {
  repoName?: string;
  repoCloneUrl?: string;
  repoUpdatedAt?: string;
  projectName?: string;
  nodeVersion?: string;
  installCommand?: string;
  buildCommand?: string;
  buildType?: string;
  envList?: string;
  space?: string;
  instanceId?: string;
  deployedUrl?: string;
  lastCommitMessage?: string;
  lastCommitHash?: string;
  webhookId?: string;
  deployments?: ProjectType["_id"][];
  publicIpAddress?: string;
};

class ProjectModel {
  static async create(data: BuildOptions) {
    const {
      userId,
      space,
      repoName,
      repoCloneUrl,
      projectName,
      nodeVersion,
      installCommand,
      buildCommand,
      envList,
      buildType,
    } = data;

    if (
      !userId ||
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

  static async findByIdAndUpdate(id: Id, data: Property) {
    const updatedProject = await Project.updateOne(
      { _id: id },
      { $set: { ...data } },
    );

    return updatedProject;
  }

  static async findByIdAndUpdateDeployment(projectId: Id, deploymentId: Id) {
    if (!projectId || !deploymentId) {
      throw Error("Expected 2 arguments, but insufficient arguments.");
    }

    const updatedProject = await Project.updateOne(
      { _id: projectId },
      { $push: { deployments: deploymentId } },
    );

    return updatedProject;
  }

  static async findByIdAndDelete(id: Id) {
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
