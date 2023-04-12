import { spawn } from "child_process";

import { FrameWorkPresets } from "../@constants/frameWorkPresets";
import { Logger as log } from "../../common/Logger";

import type { Framework } from "../types";

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
  childProcess.stderr?.on("data", log.buildError);

  await new Promise<number>((resolve, reject) => {
    childProcess.on("exit", (code: number) => {
      if (code === null) {
        reject(`Git clone childProcess exited with code ${code}`);
      }

      log.debug(`Git clone childProcess exited with code ${code}`);
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

  log.debug("start install");

  childProcess.stdout.setEncoding("utf8");
  childProcess.stderr.setEncoding("utf8");
  childProcess.stdout?.on("data", log.debug);
  childProcess.stderr?.on("data", log.buildError);

  await new Promise<number>((resolve, reject) => {
    childProcess.on("exit", (code: number) => {
      if (code === null) {
        reject(`npm install process exited with code ${code}`);
      }

      log.debug(`npm install process exited with code ${code}`);
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
  childProcess.stderr?.on("data", log.buildError);

  await new Promise<number>((resolve, reject) => {
    childProcess.on("exit", (code: number) => {
      if (code === null) {
        reject(`${buildCommand} process exited with code ${code}`);
      }

      log.buildError(`${buildCommand} process exited with code ${code}`);
      resolve(code || 0);
    });
  });

  log.build("Build complete.");
};

export async function makeBuildResource({
  repoCloneUrl,
  repoName,
  framework,
  installCommand,
  buildCommand,
}: Options) {
  try {
    await runGitClone({ repoCloneUrl });
    await runDependenciesInstall({ repoName, installCommand });
    await runBuild({ repoName, buildCommand });

    const buildResourceLocation = `./buildResource/${repoName}/${FrameWorkPresets[framework].buildDirectory}`;

    return buildResourceLocation;
  } catch (error) {
    throw error;
  }
}
