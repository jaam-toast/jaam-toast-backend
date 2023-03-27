import {
  ChangeStreamInsertDocument,
  ChangeStreamUpdateDocument,
} from "mongodb";

import BuildClient from "@src/services/BuildClient";

import { Project } from "@src/types/db";

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
    const buildClient = new BuildClient();
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
    !instanceId ||
    !publicIpAddress
  ) {
    throw Error("The data is incorrect.");
  }

  const deploymentId = deployments[0];

  try {
    const buildClient = new BuildClient();
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

  const { projectName, instanceId, publicIpAddress } = stream.fullDocument;

  try {
    if (instanceId && publicIpAddress && projectName) {
      const buildClient = new BuildClient();
      await buildClient.deleteBuild({
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
