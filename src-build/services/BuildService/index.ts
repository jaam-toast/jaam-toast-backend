import Service from "../Service";
import log from "../Logger";
import DBClient from "../DBClient";

import createInstance from "./handlers/createInstance";
import waitPublicIpAdreessCreation from "./handlers/waitPublicIpAdressCreation";
import updateProjectRequest from "./handlers/updateProjectRequest";
import createDomain from "./handlers/createDomain";
import waitDnsRecordCreation from "./handlers/waitDnsRecordCreation";
import createHttpsCertification from "./handlers/createHttpsCertification";
import waitInstanceLogStremCreation from "./handlers/waitInstanceLogStremCreation";
import getInstanceFilteredLogs from "./handlers/getInstanceFilteredLogs";
import removeBuild from "./handlers/removeBuild";

import { BuildOptions, DeleteBuildOptions, Env, LogMessage } from "../../types";
import updateDeployRequest from "./handlers/updateDeployRequest";

class BuildService extends Service {
  /* deploy options */
  projectId?: string;
  deploymentId?: string;
  subdomain?: string; // * projectName
  space?: string;
  repoCloneUrl?: string;
  repoName?: string;
  nodeVersion?: string;
  installCommand?: string;
  buildCommand?: string;
  buildType?: string;
  envList?: Env[];

  /* build data */
  instanceId?: string;
  deployedUrl?: string;
  recordId?: string;
  publicIpAddress?: string;
  buildingLog?: (string | undefined)[];
  dbClient: DBClient;

  constructor() {
    super();

    this.dbClient = new DBClient();
  }

  /* methods */
  async startBuild(buildOptions: BuildOptions): Promise<BuildService> {
    this.projectId = buildOptions.projectId;
    this.deploymentId = buildOptions.deploymentId;
    this.subdomain = buildOptions.subdomain;
    this.space = buildOptions.space;
    this.repoCloneUrl = buildOptions.repoCloneUrl;
    this.repoName = buildOptions.repoName;
    this.nodeVersion = buildOptions.nodeVersion;
    this.installCommand = buildOptions.installCommand;
    this.buildCommand = buildOptions.buildCommand;
    this.buildType = buildOptions.buildType;
    this.envList = buildOptions.envList;

    try {
      await this.use(
        createInstance,
        waitPublicIpAdreessCreation,
        updateProjectRequest,
        createDomain,
        waitDnsRecordCreation,
        createHttpsCertification,
        waitInstanceLogStremCreation,
        getInstanceFilteredLogs,
        updateDeployRequest,
      );

      return this;
    } catch (error) {
      throw error;
    }
  }

  async removeBuild(
    deleteBuildOptions: DeleteBuildOptions,
  ): Promise<BuildService> {
    try {
      this.subdomain = deleteBuildOptions.subdomain;
      this.instanceId = deleteBuildOptions.instanceId;
      this.publicIpAddress = deleteBuildOptions.publicIpAddress;

      await this.use(removeBuild);
    } catch (error) {
      throw error;
    }

    return this;
  }

  // log db 업데이트용
  buildLog(...messages: LogMessage[]) {
    log.build(...messages);

    return this.dbClient.updateDeployment({
      deploymentId: this.deploymentId,
      buildingLog: [...messages],
    });
  }

  debugLog(...messages: LogMessage[]) {
    log.build(...messages);

    return this.dbClient.updateDeployment({
      deploymentId: this.deploymentId,
      buildingLog: [...messages],
    });
  }

  buildErrorLog(...messages: LogMessage[]) {
    log.buildError(...messages);

    return this.dbClient.updateDeployment({
      deploymentId: this.deploymentId,
      buildingLog: [...messages],
    });
  }

  throw(message: string, error?: unknown): never {
    log.buildError(message);

    this.dbClient.updateDeployment({
      deploymentId: this.deploymentId,
      buildingLog: [message],
    });

    throw new Error(message);
  }
}

export default BuildService;
