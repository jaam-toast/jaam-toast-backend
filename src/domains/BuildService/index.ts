import path from "path";
import axios from "axios";
import { inject, injectable } from "inversify";
import { isEmpty } from "lodash";

import Config from "../../@config";
import { runCommand } from "../../@utils/runCommand";
import { waitFor } from "../../@utils/waitFor";
import { emitEvent, subscribeEvent } from "../../@utils/emitEvent";
import {
  ForbiddenError,
  NotFoundError,
  UnknownError,
} from "../../@utils/defineErrors";
import { PRAMEWORK_PRESET } from "../@config/frameworkPreset";
import * as log from "../../@utils/log";
import { BaseError } from "../../@types/baseError";

import type { Env, Framework, Project } from "../../@types/project";
import type {
  DeploymentClient,
  RecordClient,
  Repository,
} from "../../@config/di.config";
import type { SocketClient } from "../../infrastructure/SocketClient";

const RESOURCES_PATH = "./resources";

@injectable()
export class BuildService {
  private deploymentClient: DeploymentClient;
  private recordClient: RecordClient;
  private socketClient: SocketClient;
  private projectRepository: Repository<Project>;

  constructor(
    @inject("S3CloudFrontDeploymentClient")
    s3CloudFrontDeploymentClient: DeploymentClient,
    @inject("Route53RecordClient") route53RecordClient: RecordClient,
    @inject("SocketClient") socketClient: SocketClient,
    @inject("ProjectRepository") projectRepository: Repository<Project>,
  ) {
    this.deploymentClient = s3CloudFrontDeploymentClient;
    this.recordClient = route53RecordClient;
    this.socketClient = socketClient;
    this.projectRepository = projectRepository;
  }

  private async installResouce({
    resourceName,
    repoCloneUrl,
    repoName,
    envList,
    installCommand,
    buildCommand,
    framework,
  }: {
    resourceName: string;
    repoCloneUrl: string;
    repoName: string;
    envList: Env[];
    installCommand: string;
    buildCommand: string;
    framework: Framework;
  }) {
    try {
      /**
       * Run git clone
       */
      await runCommand({
        command: [
          `mkdir ${resourceName}`,
          `cd ${resourceName}`,
          `git clone ${repoCloneUrl}`,
        ],
        cwd: path.join(process.cwd(), RESOURCES_PATH),
        onStdout: log.debug,
        onStderr: log.debug,
      });

      log.build("Repository has been successfully retrieved.");

      /**
       * Install environmet variables
       */
      if (!isEmpty(envList)) {
        const envFileText = envList
          .map(({ key, value }) => `${key}=${value}`)
          .join("\n");

        await runCommand({
          command: [`touch .env`, `echo "${envFileText}" > .env`],
          cwd: path.join(process.cwd(), RESOURCES_PATH, resourceName, repoName),
        });

        log.build("Environment variable has been successfully completed.");
      }

      /**
       * Install packages
       */
      await runCommand({
        command: [installCommand],
        cwd: path.join(process.cwd(), RESOURCES_PATH, resourceName, repoName),
        onStdout: log.debug,
        onStderr: log.debug,
      });

      log.build("Finish installing the necessary files for your project.");

      /**
       * Build project
       */
      await runCommand({
        command: [buildCommand],
        cwd: path.join(process.cwd(), RESOURCES_PATH, resourceName, repoName),
        onStdout: log.build,
      });

      log.build("User project resource creation completed.");

      const resourcePath = path.join(
        process.cwd(),
        RESOURCES_PATH,
        resourceName,
        repoName,
        PRAMEWORK_PRESET[framework].buildDirectory,
      );

      return resourcePath;
    } catch (error) {
      throw error;
    }
  }

  async createBuild({
    repoName,
    repoCloneUrl,
    projectName,
    framework,
    installCommand,
    buildCommand,
    envList,
  }: {
    repoName: string;
    repoCloneUrl: string;
    projectName: string;
    framework: Framework;
    installCommand: string;
    buildCommand: string;
    envList: Env[];
  }) {
    log.build("We will now initiate the deployment process.");

    try {
      const jaamToastDomain = `${projectName}.${Config.SERVER_URL}`;
      const resourcePath = await this.installResouce({
        resourceName: projectName,
        repoCloneUrl,
        repoName,
        envList,
        installCommand,
        buildCommand,
        framework,
      });

      /**
       * upload resources
       */
      const { deploymentData, originalBuildDomain } =
        await this.deploymentClient.createDeployment({
          domainName: jaamToastDomain,
          resourcePath,
        });

      log.build("The creation of a new deployment is now complete!");
      log.build(
        "Initiating domain connection process for the created deployment.",
      );

      /**
       * create A record.
       */
      const recordId = await this.recordClient.createARecord({
        recordName: jaamToastDomain,
        recordTarget: originalBuildDomain,
      });

      await waitFor({
        act: () => this.recordClient.getRecordStatus({ recordId }),
        until: async isCreated => await isCreated,
      });

      log.build("All deployment processes have been completed!");

      emitEvent("DEPLOYMENT_UPDATED", {
        projectName,
        deploymentData,
        originalBuildDomain,
        jaamToastDomain,
        resourcePath,
      });
    } catch (error) {
      if (error instanceof Error) {
        emitEvent("DEPLOYMENT_ERROR", {
          projectName,
          error,
        });
      }
    } finally {
      /**
       * remove resource
       */
      runCommand({
        command: [`rm -rf ${projectName}`],
        cwd: path.join(process.cwd(), RESOURCES_PATH),
        onStdout: log.debug,
        onStderr: log.debug,
      });
    }
  }

  async updateBuild({ projectName }: { projectName: string }) {
    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });

      if (!project) {
        throw new NotFoundError("Cannot find Project data.");
      }
      if (!project.deploymentData) {
        throw new ForbiddenError(
          "Cannot update the project sinse the project initially delployed yet.",
        );
      }

      const {
        repoCloneUrl,
        repoName,
        envList,
        installCommand,
        buildCommand,
        framework,
        deploymentData,
      } = project;

      const jaamToastDomain = `${projectName}.${Config.SERVER_URL}`;
      const resourcePath = await this.installResouce({
        resourceName: projectName,
        repoCloneUrl,
        repoName,
        envList,
        installCommand,
        buildCommand,
        framework,
      });

      /**
       * Update resource
       */
      await this.deploymentClient.updateDeployment({
        domainName: jaamToastDomain,
        deploymentData,
        resourcePath,
      });

      emitEvent("DEPLOYMENT_UPDATED", {
        projectName,
      });
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }

      throw new UnknownError(
        "An unknown error has occurred during the update process.",
      );
    }
  }

  async deleteBuild({ projectName }: { projectName: string }) {
    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });

      if (!project) {
        throw new NotFoundError("Cannot find Project data.");
      }

      const jaamToastDomain = `${projectName}.${Config.SERVER_URL}`;

      await this.deploymentClient.deleteDeployment({
        domainName: jaamToastDomain,
        deploymentData: project.deploymentData,
      });

      if (project.originalBuildDomain) {
        for await (const customDomain of project.customDomain) {
          await this.recordClient.deleteCNAME({
            recordName: customDomain,
            recordTarget: project.originalBuildDomain,
          });
        }

        await this.recordClient.deleteARecord({
          recordName: jaamToastDomain,
          recordTarget: project.originalBuildDomain,
        });
      }
    } catch (error) {
      throw new UnknownError(
        "An unexpected error occurred during build project",
        error,
      );
    }
  }

  async connectDomain({
    projectName,
    customDomain,
  }: {
    projectName: string;
    customDomain: string;
  }) {
    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });

      if (!project) {
        throw new NotFoundError("Cannot find Project data.");
      }
      if (!project.originalBuildDomain) {
        throw new ForbiddenError(
          "Cannot delete domain sinse the project initially delployed yet.",
        );
      }

      await this.recordClient.createCNAME({
        recordName: customDomain,
        recordTarget: project.originalBuildDomain,
      });

      await this.deploymentClient.updateDeploymentDomain({
        deploymentData: project.deploymentData,
        domain: project.customDomain.concat(customDomain),
      });
    } catch (error) {
      throw new UnknownError(
        "An unexpected error occurred during connect custom domain.",
        error,
      );
    }
  }

  async disconnectDomain({
    projectName,
    customDomain,
  }: {
    projectName: string;
    customDomain: string;
  }) {
    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });
      const newCustomDomain = project?.customDomain.filter(
        domain => domain !== customDomain,
      );

      if (!project) {
        throw new NotFoundError("Cannot find Project data.");
      }
      if (project.customDomain.length === newCustomDomain?.length) {
        throw new NotFoundError("Cannot find custom domain data.");
      }
      if (!project.originalBuildDomain) {
        throw new ForbiddenError(
          "Cannot delete domain sinse the project initially delployed yet.",
        );
      }

      await this.recordClient.deleteCNAME({
        recordName: customDomain,
        recordTarget: project.originalBuildDomain,
      });

      await this.deploymentClient.updateDeploymentDomain({
        deploymentData: project.deploymentData,
        domain: project.customDomain.filter(domain => domain !== customDomain),
      });
    } catch (error) {
      throw new UnknownError(
        "An unexpected error occurred during disconnect custom domain.",
        error,
      );
    }
  }
}
