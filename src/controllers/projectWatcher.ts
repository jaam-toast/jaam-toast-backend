import {
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
} from "mongodb";

import BuildClient from "@src/services/BuildClient";

import { Project } from "@src/types/db";
import { signJwt } from "@src/controllers/utils/jwt";

export const projectWatchFields = [
  "_id",
  "space",
  "repoName",
  "repoCloneUrl",
  "repoUpdatedAt",
  "projectName",
  "nodeVersion",
  "installCommand",
  "buildCommand",
  "buildType",
  "envList",
  "lastCommitMessage",
  "status",
];

export const insertWatch = async (
  stream: ChangeStreamInsertDocument<Project>,
): Promise<void> => {
  const {
    _id: projectId,
    deployments,
    projectName,
    space,
    repoCloneUrl,
    repoName,
    nodeVersion,
    installCommand,
    buildCommand,
    buildType,
    envList,
  } = stream.fullDocument;

  if (
    !projectId ||
    !deployments ||
    !projectName ||
    !space ||
    !repoCloneUrl ||
    !repoName ||
    !nodeVersion ||
    !installCommand ||
    !buildCommand ||
    !buildType ||
    !envList
  ) {
    throw Error("The data is incorrect.");
  }

  const deploymentId = deployments[0];

  try {
    const token = signJwt(projectId.toString());
    const buildClient = new BuildClient(token);
    await buildClient.createBuild({
      projectId: projectId.toString(),
      deploymentId: deploymentId.toString(),
      space,
      projectName,
      repoName,
      repoCloneUrl,
      nodeVersion,
      installCommand,
      buildCommand,
      buildType,
      envList,
    });

    return;
  } catch (error) {
    throw error;
  }
};

export const updateWatch = async (
  stream: ChangeStreamUpdateDocument<Project>,
) => {
  if (!stream.fullDocument) {
    throw Error("The data is incorrect.");
  }

  const {
    _id: projectId,
    deployments,
    projectName,
    space,
    repoCloneUrl,
    repoName,
    nodeVersion,
    installCommand,
    buildCommand,
    buildType,
    envList,
    instanceId,
    publicIpAddress,
  } = stream.fullDocument;

  if (
    !projectId ||
    !deployments ||
    !projectName ||
    !space ||
    !repoCloneUrl ||
    !repoName ||
    !nodeVersion ||
    !installCommand ||
    !buildCommand ||
    !buildType ||
    !envList ||
    !instanceId
  ) {
    throw Error("The data is incorrect.");
  }

  const deploymentId = deployments[0];

  try {
    const token = signJwt(projectId.toString());
    const buildClient = new BuildClient(token);
    await buildClient.updateBuild({
      projectId: projectId.toString(),
      deploymentId: deploymentId.toString(),
      space,
      projectName,
      repoName,
      repoCloneUrl,
      nodeVersion,
      installCommand,
      buildCommand,
      buildType,
      envList,
      instanceId,
      publicIpAddress,
    });

    return;
  } catch (error) {
    throw error;
  }
};

export const deleteWatch = async (
  stream: ChangeStreamUpdateDocument<Project>,
): Promise<void> => {
  if (!stream.fullDocument) {
    throw Error("The data is incorrect.");
  }

  const {
    _id: projectId,
    projectName,
    instanceId,
    publicIpAddress,
  } = stream.fullDocument;

  try {
    if (projectId && instanceId && projectName) {
      const token = signJwt(projectId.toString());
      const buildClient = new BuildClient(token);
      await buildClient.deleteBuild({
        projectId: projectId.toString(),
        projectName,
        instanceId,
        publicIpAddress,
      });
    }

    return;
  } catch (error) {
    throw error;
  }
};
