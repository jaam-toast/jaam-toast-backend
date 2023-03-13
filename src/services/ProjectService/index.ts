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
  public githubAccessToken;
  public repoName;
  public repoCloneUrl;
  public repoUpdatedAt;
  public subdomain;
  public userId;
  public nodeVersion;
  public installCommand;
  public buildCommand;
  public envList;
  public buildType;

  /* build data */
  public instanceId?: string;
  public deployedUrl?: string;
  public lastCommitMessage?: string;
  public webhookId?: string;
  public recordId?: string;
  public publicIpAddress?: string;
  public buildingLog?: (string | undefined)[];
  public repoId?: string;
  public repoOwner?: string;

  constructor(buildOption: BuildOption) {
    super();

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
  }

  /* methods */
  public async deployProject() {
    return await ProjectService.use<ProjectService>(
      setGithubInfo,
      createInstance,
      createWebhook,
      waitPublicIpAdreessCreation,
      createDomain,
      waitDnsRecordCreation,
      createHttpsCertification,
      waitInstanceLogStremCreation,
      getInstanceFilteredLogs,
    );
  }
}

export default ProjectService;
