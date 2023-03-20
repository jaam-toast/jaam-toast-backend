import Service from "@src/services/Service";
import log from "@src/services/Logger";
import setGithubInfo from "./handlers/setGithubInfo";
import createInstance from "./handlers/createInstance";
import createWebhook from "./handlers/createWebhook";
import waitPublicIpAdreessCreation from "./handlers/waitPublicIpAdressCreation";
import createDomain from "./handlers/createDomain";
import waitDnsRecordCreation from "./handlers/waitDnsRecordCreation";
import createHttpsCertification from "./handlers/createHttpsCertification";
import waitInstanceLogStremCreation from "./handlers/waitInstanceLogStremCreation";
import getInstanceFilteredLogs from "./handlers/getInstanceFilteredLogs";
import saveProject from "./handlers/saveProject";
import removeDeployment from "./handlers/removeDeployment";
import updateInstance from "./handlers/updateInstace";
import removeProject from "./handlers/removeProject";
import updateProject from "./handlers/updateProject";

import { Types } from "mongoose";
import {
  BuildOptions,
  Env,
  ProjectDeleteOptions,
  RedeployOptions,
} from "@src/types";

class ProjectService extends Service {
  /* build options */
  githubAccessToken?: string;
  repoName?: string;
  repoCloneUrl?: string;
  repoUpdatedAt?: string;
  subdomain?: string;
  userId?: string;
  nodeVersion?: string;
  installCommand?: string;
  buildCommand?: string;
  envList?: Env[];
  buildType?: string;

  /* build data */
  instanceId?: string;
  deployedUrl?: string;
  lastCommitMessage?: string;
  webhookId?: string;
  recordId?: string;
  publicIpAddress?: string;
  buildingLog?: (string | undefined)[];
  repoId?: Types.ObjectId;
  repoOwner?: string;

  /* methods */
  async deployProject(buildOptions: BuildOptions): Promise<ProjectService> {
    this.githubAccessToken = buildOptions.githubAccessToken;
    this.repoName = buildOptions.repoName;
    this.repoCloneUrl = buildOptions.repoCloneUrl;
    this.repoUpdatedAt = buildOptions.repoUpdatedAt;
    this.subdomain = buildOptions.repoName;
    this.nodeVersion = buildOptions.nodeVersion;
    this.installCommand = buildOptions.installCommand;
    this.buildCommand = buildOptions.buildCommand;
    this.envList = buildOptions.envList;
    this.buildType = buildOptions.buildType;
    this.userId = buildOptions.userId;

    try {
      await this.use(
        setGithubInfo,
        createInstance,
        createWebhook,
        waitPublicIpAdreessCreation,
        createDomain,
        waitDnsRecordCreation,
        createHttpsCertification,
        waitInstanceLogStremCreation,
        getInstanceFilteredLogs,
        saveProject,
      );

      return this;
    } catch (error) {
      throw error;
    }
  }

  throw(message: string, error?: unknown): never {
    log.buildError(message);

    throw new Error(message);
  }

  async redeployProject(options: RedeployOptions): Promise<ProjectService> {
    this.lastCommitMessage = options.lastCommitMessage;
    this.repoCloneUrl = options.repoCloneUrl;
    this.repoName = options.repoName;

    try {
      await this.use(updateProject, updateInstance);
    } catch (error) {
      throw error;
    }

    return this;
  }

  async deleteDeployment(): Promise<ProjectService> {
    try {
      await this.use(removeDeployment);
    } catch (error) {
      throw error;
    }

    return this;
  }

  async deleteProject(options: ProjectDeleteOptions): Promise<ProjectService> {
    this.userId = options.userId;
    this.repoId = options.repoId;
    this.instanceId = options.instanceId;
    this.subdomain = options.subdomain;
    this.publicIpAddress = options.publicIpAddress;

    try {
      await this.use(removeDeployment, removeProject);
    } catch (error) {
      throw error;
    }

    return this;
  }
}

export default ProjectService;
