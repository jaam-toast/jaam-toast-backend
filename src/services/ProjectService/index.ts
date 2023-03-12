import Service from "../Service";

import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";

import Config from "../../config";
import { Env } from "../../types/custom";

type BuildOption = {
  repoName: string,
  repoCloneUrl: string,
  repoUpdatedAt: string,
  nodeVersion: string,
  installCommand: string,
  buildCommand: string,
  envList: Env[],
  buildType: string,
}

class ProjectService extends Service {
  /* build options */
  public githubAccessToken?: string;
  public repoName?: string;
  public repoOwner?: string;
  public repoCloneUrl?: string;
  public repoUpdatedAt?: string;

  public nodeVersion?: string;
  public installCommand?: string;
  public buildCommand?: string;
  public envList?: Env[];
  public buildType?: string;

  /* build data */
  public instanceId?: string;
  public deployedUrl?: string;
  public lastCommitMessage?: string;
  public webhookId?: string;
  public recordId?: string;
  public publicIpAddress?: string;

  constructor(buildOption: BuildOption) {
    super();

    this.repoName = buildOption.repoName;
    this.repoCloneUrl = buildOption.repoCloneUrl;
    this.repoUpdatedAt = buildOption.repoUpdatedAt;
    this.nodeVersion = buildOption.nodeVersion;
    this.installCommand = buildOption.installCommand;
    this.buildCommand = buildOption.buildCommand;
    this.envList = buildOption.envList;
    this.buildType = buildOption.buildType;
  }

  /* handlers */
  public throwError(error: { code: string, message: string }) {
    throw new DeploymentError(error);
  }
  // to Be
  public debug = createDeploymentDebug(false);

  static createInstance = () => { };
  static createWebhook = () => { };
  static setGitHubInfo = () => { };
  static createDomain = () => { };
  static createHTTPS = () => { };
  static getInstanceLog = () => { };
  static getSaveData = () => { };
  static getFilterData = () => { };

  /* methods */
  public deployProject() {
    return ProjectService.use(
      ProjectService.setGitHubInfo,
      ProjectService.createInstance,
      ProjectService.createWebhook,
      ProjectService.createDomain,
      ProjectService.createHTTPS,
      ProjectService.getInstanceLog,
      ProjectService.getSaveData,
      ProjectService.getFilterData,
    );
  }
}

export default ProjectService;
