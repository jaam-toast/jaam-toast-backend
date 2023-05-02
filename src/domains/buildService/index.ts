import path from "path";
import { inject, injectable } from "inversify";
import { isEmpty } from "lodash";

import Config from "../../@config";
import { runCommand } from "../../@utils/runCommand";
import { waitFor } from "../../@utils/waitFor";
import { emitEvent, subscribeEvent } from "../../@utils/emitEvent";
import { UnknownError, ValidateError } from "../../@utils/defineErrors";
import { PRAMEWORK_PRESET } from "../@config/frameworkPreset";
import * as log from "../../@utils/log";

import type { Env, Framework } from "../../@types/project";
import type {
  DeploymentClient,
  DomainClient,
  RecordClient,
} from "../../@config/di.config";
import type { SocketClient } from "src/infrastructure/SocketClient";

const RESOURCES_PATH = "./resources";

@injectable()
export class BuildService {
  private deploymentClient: DeploymentClient;
  private recordClient: RecordClient;
  private domainClient: DomainClient;
  private socketClient: SocketClient;

  constructor(
    @inject("CloudFlareDeploymentClient")
    cloudFlareDeploymentClient: DeploymentClient,
    @inject("Route53RecordClient") route53RecordClient: RecordClient,
    @inject("CloudFlareDomainClient") cloudFlareDomainClient: DomainClient,
    @inject("SocketClient") socketClient: SocketClient,
  ) {
    this.deploymentClient = cloudFlareDeploymentClient;
    this.recordClient = route53RecordClient;
    this.domainClient = cloudFlareDomainClient;
    this.socketClient = socketClient;
  }

  async createDeployment({
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
    /**
     * configure socket building log
     */
    this.socketClient.server.on("connection", socket => {
      socket.on("get-building-log", project => {
        log.debug(`Getting ready for sending a building log for ${project}`);
        log.subscribe(message => socket.emit("new-building-log", message));

        subscribeEvent(
          "PROJECT_CREATED",
          ({ originalBuildDomain }, unsubscribe) => {
            socket.emit(
              "build-complete",
              JSON.stringify({ originalBuildDomain }),
            );
            unsubscribe();
          },
        );

        subscribeEvent("PROJECT_CREATION_ERROR", ({ message }, unsubscribe) => {
          socket.emit("build-error", message);
          unsubscribe();
        });
      });
    });

    try {
      /**
       * run git clone
       */
      await runCommand({
        command: [
          `rm -rf ${projectName}`,
          `mkdir ${projectName}`,
          `cd ${projectName}`,
          `git clone ${repoCloneUrl}`,
        ],
        cwd: path.join(process.cwd(), RESOURCES_PATH),
        onStdout: log.debug,
        onStderr: log.debug,
      });

      log.build("Cloning complete.");

      /**
       * install environmet variables
       */
      if (!isEmpty(envList)) {
        const envFileText = envList
          .map(({ key, value }) => `${key}=${value}`)
          .join("\n");

        await runCommand({
          command: [`touch .env`, `echo "${envFileText}" > .env`],
          cwd: path.join(process.cwd(), RESOURCES_PATH, projectName, repoName),
        });

        log.build("Evironment Varables complete.");
      }

      /**
       * install packages
       */
      await runCommand({
        command: [installCommand],
        cwd: path.join(process.cwd(), RESOURCES_PATH, projectName, repoName),
        onStdout: log.debug,
        onStderr: log.debug,
      });

      log.build("Finish installing the necessary files for your project");

      /**
       * run project
       */
      await runCommand({
        command: [buildCommand],
        cwd: path.join(process.cwd(), RESOURCES_PATH, projectName, repoName),
        onStdout: log.build,
      });

      log.build("User project resource creation complete");

      const resourcePath = path.join(
        process.cwd(),
        RESOURCES_PATH,
        projectName,
        repoName,
        PRAMEWORK_PRESET[framework].buildDirectory,
      );
      const jaamToastDomain = `${projectName}.${Config.SERVER_URL}`;

      /**
       * upload resources
       */
      const originalBuildDomain = await this.deploymentClient.createDeployment({
        projectName,
        resourcePath,
      });

      /**
       * create CNAME record
       */
      const recordId = await this.recordClient.createCNAME({
        recordName: jaamToastDomain,
        recordValue: originalBuildDomain,
      });

      await waitFor({
        act: () => this.recordClient.getRecordStatus({ recordId }),
        until: async isCreated => await isCreated,
      });

      /**
       * add jaam toast domain
       */
      await this.domainClient.addDomain({
        projectName,
        domain: jaamToastDomain,
      });

      emitEvent("PROJECT_CREATED", {
        projectName,
        jaamToastDomain,
        originalBuildDomain,
        resourcePath,
      });
    } catch (error) {
      if (error instanceof Error) {
        emitEvent("PROJECT_CREATION_ERROR", {
          projectName,
          message: error.message,
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

  async updateBuild() {}

  async deleteBuild({ projectName }: { projectName: string }) {
    try {
      if (!projectName) {
        throw new ValidateError(
          "Cannot find environment data before delete project.",
        );
      }
    } catch (error) {
      throw new UnknownError(
        "An unexpected error occurred during build project",
        error,
      );
    }
  }
}
