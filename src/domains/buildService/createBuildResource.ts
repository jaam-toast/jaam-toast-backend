import { spawn } from "child_process";

import { FrameWorkPresets } from "../@config/frameWorkPresets";
import { Logger as log } from "../../utils/Logger";

import { Framework } from "../../repositories/@types";
import { BUILD_MESSAGE } from "../../config/constants";

type Options = {
  repoCloneUrl: string;
  repoName: string;
  framework: Framework;
  installCommand: string;
  buildCommand: string;
};

const runGitClone = async ({ repoCloneUrl }: Pick<Options, "repoCloneUrl">) => {
  const command = [
    "rm -rf buildResource",
    "mkdir buildResource",
    "cd buildResource",
    `git clone ${repoCloneUrl}`,
  ].join(" && ");

  const childProcess = spawn(command, {
    cwd: process.cwd(),
    shell: true,
    stdio: "pipe",
  });

  childProcess.stdout.setEncoding("utf8");
  childProcess.stderr.setEncoding("utf8");
  childProcess.stdout?.on("data", log.debug);
  childProcess.stderr?.on("data", log.debug);

  await new Promise<number>(resolve => {
    childProcess.on("exit", (code: number) => {
      if (code === null) {
        log.error(
          `Git clone ${BUILD_MESSAGE.CHILD_PROCESS_EXITED_WITH_CODE} null`,
        );
      }

      log.debug(
        `Git clone ${BUILD_MESSAGE.CHILD_PROCESS_EXITED_WITH_CODE} ${code}`,
      );

      resolve(code || 0);
    });
  });

  log.debug("Cloning complete.");
};

const runDependenciesInstall = async ({
  repoName,
  installCommand,
}: Pick<Options, "installCommand" | "repoName">) => {
  const childProcess = spawn(installCommand, {
    cwd: `./buildResource/${repoName}`,
    shell: true,
    stdio: "pipe",
  });

  childProcess.stdout.setEncoding("utf8");
  childProcess.stderr.setEncoding("utf8");
  childProcess.stdout?.on("data", log.debug);
  childProcess.stderr?.on("data", log.debug);

  await new Promise<number>(resolve => {
    childProcess.on("exit", (code: number) => {
      if (code === null) {
        log.error(
          `Dependencies install ${BUILD_MESSAGE.CHILD_PROCESS_EXITED_WITH_CODE} null`,
        );
      }

      log.debug(
        `Dependencies install ${BUILD_MESSAGE.CHILD_PROCESS_EXITED_WITH_CODE} ${code}`,
      );

      resolve(code || 0);
    });
  });

  log.debug("Dependencies installed.");
};

const runBuild = async ({
  repoName,
  buildCommand,
}: Pick<Options, "buildCommand" | "repoName">) => {
  const childProcess = spawn(buildCommand, {
    cwd: `./buildResource/${repoName}`,
    shell: true,
    stdio: "pipe",
  });

  log.debug("start build");

  childProcess.stdout.setEncoding("utf8");
  childProcess.stderr.setEncoding("utf8");
  childProcess.stdout?.on("data", log.build);
  childProcess.stderr?.on("data", log.debug);

  await new Promise<number>((resolve, reject) => {
    childProcess.on("exit", (code: number) => {
      if (code === null) {
        log.error(
          `${buildCommand} ${BUILD_MESSAGE.CHILD_PROCESS_EXITED_WITH_CODE} null`,
        );
      }

      log.debug(
        `${buildCommand} ${BUILD_MESSAGE.CHILD_PROCESS_EXITED_WITH_CODE} ${code}`,
      );

      resolve(code || 0);
    });
  });
};

export async function createBuildResource({
  repoCloneUrl,
  repoName,
  framework,
  installCommand,
  buildCommand,
}: Options) {
  try {
    await runGitClone({ repoCloneUrl });

    await runDependenciesInstall({ repoName, installCommand });
    log.build(BUILD_MESSAGE.CREATE.COMPLETE_INSTALL_DEPENDENCIES);

    await runBuild({ repoName, buildCommand });
    log.build(BUILD_MESSAGE.CREATE.COMPLETE_RESOURCE_CREATE);

    const buildResourceLocation = `./buildResource/${repoName}/${FrameWorkPresets[framework].buildDirectory}`;

    return buildResourceLocation;
  } catch (error) {
    throw Error(BUILD_MESSAGE.CREATE_ERROR.FAIL_RESOURCE_CREATION);
  }
}
