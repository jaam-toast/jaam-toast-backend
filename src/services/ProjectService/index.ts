import { Types } from "mongoose";
import Service from "@src/services/Service";
import log from "@src/services/Logger";
import setGithubInfo from "./handlers/setGithubInfo";
import createWebhook from "./handlers/createWebhook";
import checkWebhook from "./handlers/checkWebhook";
import saveProject from "./handlers/saveProject";
import updateProject from "./handlers/updateProject";
import deleteProject from "./handlers/deleteProject";

import type { BuildOptions, Env } from "@src/types";
import type { ProjectOptions } from "@src/types/db";

class ProjectService extends Service {
  userId?: string;
  space?: string;
  repoName?: string;
  repoCloneUrl?: string;
  projectUpdatedAt?: string;
  projectName?: string;
  nodeVersion?: string;
  installCommand?: string;
  buildCommand?: string;
  envList?: Env[];
  buildType?: string;
  githubAccessToken?: string;

  webhookId?: number;
  lastCommitMessage?: string;
  lastCommitHash?: string;
  deployments?: Types.ObjectId[];
  instanceId?: string;
  deployedUrl?: string;
  publicIpAddress?: string;
  projectId?: Types.ObjectId | string;
  deploymentId?: Types.ObjectId;

  /* methods */
  async createProject(buildOptions: BuildOptions): Promise<ProjectService> {
    this.githubAccessToken = buildOptions.githubAccessToken;
    this.userId = buildOptions.userId;
    this.space = buildOptions.space;
    this.repoName = buildOptions.repoName;
    this.repoCloneUrl = buildOptions.repoCloneUrl;
    this.projectUpdatedAt = buildOptions.projectUpdatedAt;
    this.projectName = buildOptions.projectName;
    this.nodeVersion = buildOptions.nodeVersion;
    this.installCommand = buildOptions.installCommand;
    this.buildCommand = buildOptions.buildCommand;
    this.envList = buildOptions.envList;
    this.buildType = buildOptions.buildType;

    try {
      await setGithubInfo(this, () => {});
      await checkWebhook(this, () => {});
      await createWebhook(this, () => {});
      await saveProject(this, () => {});

      return this;
    } catch (error) {
      throw error;
    }
  }

  throw(message: string, error?: unknown): never {
    log.buildError(message);

    throw new Error(message);
  }

  async updateProject(updateOptions: ProjectOptions): Promise<ProjectService> {
    this.projectUpdatedAt = updateOptions.projectUpdatedAt;
    this.projectName = updateOptions.projectName;
    this.nodeVersion = updateOptions.nodeVersion;
    this.installCommand = updateOptions.installCommand;
    this.buildCommand = updateOptions.buildCommand;
    this.envList = updateOptions.envList;
    this.buildType = updateOptions.buildType;
    this.webhookId = updateOptions.webhookId;
    this.projectUpdatedAt = updateOptions.projectUpdatedAt;
    this.lastCommitMessage = updateOptions.lastCommitMessage;
    this.lastCommitHash = updateOptions.lastCommitHash;

    try {
      await updateProject(this, () => {});

      return this;
    } catch (error) {
      throw error;
    }
  }

  async deleteProject(
    projectName: ProjectOptions["projectName"],
  ): Promise<ProjectService> {
    this.projectName = projectName;
    try {
      await deleteProject(this, () => {});

      return this;
    } catch (error) {
      throw error;
    }
  }
}

export default ProjectService;
