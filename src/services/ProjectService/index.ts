import Service from "../Service";
import setGithubInfo from "./setGithubInfo";
import createInstance from "./createInstance";
import createWebhook from "./createWebhook";
import waitPublicIpAdreessCreation from "./waitPublicIpAdressCreation";
import createDomain from "./createDomain";
import waitDnsRecordCreation from "./waitDnsRecordCreation";
import createHttpsCertification from "./createHttpsCertification";
import waitInstanceLogStremCreation from "./waitInstanceLogStremCreation";
import getInstanceFilteredLogs from "./getInstanceFilteredLogs";
import saveProject from "./saveProject";
import clearDeployment from "./clearDeployment";
import updateInstance from "./updateInstace";
import removeProject from "./removeProject";
import updateProject from "./updateProject";

import { Types } from "mongoose";
import { Env } from "../../types/custom";

type BuildOption = {
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
  async deployProject(buildOption: BuildOption) {
    console.log("start deploy");

    this.githubAccessToken = buildOption.githubAccessToken;
    this.repoName = buildOption.repoName;
    this.repoCloneUrl = buildOption.repoCloneUrl;
    this.repoUpdatedAt = buildOption.repoUpdatedAt;
    this.subdomain = buildOption.repoName;
    this.nodeVersion = buildOption.nodeVersion;
    this.installCommand = buildOption.installCommand;
    this.buildCommand = buildOption.buildCommand;
    this.envList = buildOption.envList;
    this.buildType = buildOption.buildType;
    this.userId = buildOption.userId;

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
  }

  async redeployProject({
    repoCloneUrl,
    lastCommitMessage,
    repoName,
  }: {
    repoCloneUrl: string;
    lastCommitMessage: string;
    repoName: string;
  }) {
    await this.use(updateProject, updateInstance);

    return this;
  }

  async deleteDeployment() {
    await this.use(clearDeployment);

    return this;
  }

  async deleteProject({
    instanceId,
    subdomain,
    publicIpAddress,
    userId,
    repoId,
  }: {
    instanceId?: string;
    subdomain?: string;
    publicIpAddress?: string;
    userId?: string;
    repoId?: Types.ObjectId;
  }) {
    this.userId = userId;
    this.repoId = repoId;
    this.instanceId = instanceId;
    this.subdomain = subdomain;
    this.publicIpAddress = publicIpAddress;

    await this.use(clearDeployment, removeProject);

    return this;
  }
}

export default ProjectService;
