import Service from "../Service";
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
import clearDeployment from "./handlers/clearDeployment";
import updateInstance from "./handlers/updateInstace";
import removeProject from "./handlers/removeProject";
import updateProject from "./handlers/updateProject";

import { Types } from "mongoose";
import { Env } from "../../types/custom";

type RedeployOptions = {
  repoCloneUrl: string;
  lastCommitMessage: string;
  repoName: string;
};

type ProjectDeleteOptions = {
  instanceId?: string;
  subdomain?: string;
  publicIpAddress?: string;
  userId?: string;
  repoId?: Types.ObjectId;
};

type BuildOptions = {
  repoName: string;
  repoCloneUrl: string;
  repoUpdatedAt: string;
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  envList: Env[];
  buildType: string;
  githubAccessToken: string;
  userId: string;
};

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
  async deployProject(buildOptions: BuildOptions) {
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
      console.error(error);
    }
  }

  async redeployProject(options: RedeployOptions) {
    this.lastCommitMessage = options.lastCommitMessage;
    this.repoCloneUrl = options.repoCloneUrl;
    this.repoName = options.repoName;

    await this.use(updateProject, updateInstance);

    return this;
  }

  async deleteDeployment() {
    await this.use(clearDeployment);

    return this;
  }

  async deleteProject(options: ProjectDeleteOptions) {
    this.userId = options.userId;
    this.repoId = options.repoId;
    this.instanceId = options.instanceId;
    this.subdomain = options.subdomain;
    this.publicIpAddress = options.publicIpAddress;

    await this.use(clearDeployment, removeProject);

    return this;
  }
}

export default ProjectService;
