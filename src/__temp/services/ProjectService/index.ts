import { Types } from "mongoose";

import Service from "@src/__temp/services/Service";
import { Logger as log } from "@src/common/Logger";
import setGithubInfo from "./handlers/setGithubInfo";
import createWebhook from "./handlers/createWebhook";
import checkWebhook from "./handlers/checkWebhook";
import saveProject from "./handlers/saveProject";
import updateProject from "./handlers/updateProject";
import deleteProject from "./handlers/deleteProject";

import type { Env } from "@src/types";
import type { CreateProjectOptions, ProjectOptions } from "@src/types/db";

class ProjectService extends Service {
  userId?: string;
  githubAccessToken?: string;

  space?: string;
  repoName?: string;
  repoCloneUrl?: string;
  projectName?: string;
  projectUpdatedAt?: string;
  nodeVersion?: string;
  installCommand?: string;
  buildCommand?: string;
  buildType?: string;
  envList?: Env[];
  webhookId?: number;

  lastCommitMessage?: string;
  lastCommitHash?: string;
  deployments?: Types.ObjectId[];
  deployedUrl?: string;
  instanceId?: string;
  recordId?: string;
  publicIpAddress?: string;
  projectId?: Types.ObjectId | string;
  deploymentId?: Types.ObjectId;

  /* methods */
  async createProject(
    buildOptions: CreateProjectOptions,
  ): Promise<ProjectService> {
    this.githubAccessToken = buildOptions.githubAccessToken;
    this.userId = buildOptions.userId;
    this.space = buildOptions.space;
    this.repoName = buildOptions.repoName;
    this.repoCloneUrl = buildOptions.repoCloneUrl;
    this.projectName = buildOptions.projectName;
    this.projectUpdatedAt = buildOptions.projectUpdatedAt;
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
    this.space = updateOptions.space;
    this.projectName = updateOptions.projectName;
    this.projectUpdatedAt = updateOptions.projectUpdatedAt;
    this.nodeVersion = updateOptions.nodeVersion;
    this.installCommand = updateOptions.installCommand;
    this.buildCommand = updateOptions.buildCommand;
    this.buildType = updateOptions.buildType;
    this.envList = updateOptions.envList;
    this.webhookId = updateOptions.webhookId;
    this.lastCommitMessage = updateOptions.lastCommitMessage;
    this.lastCommitHash = updateOptions.lastCommitHash;
    this.instanceId = updateOptions.instanceId;
    this.deployedUrl = updateOptions.deployedUrl;
    this.recordId = updateOptions.recordId;

    try {
      await updateProject(this, () => {});

      return this;
    } catch (error) {
      throw error;
    }
  }

  async deleteProject(projectName: string): Promise<ProjectService> {
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
