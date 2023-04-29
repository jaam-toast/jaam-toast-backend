import { spawn } from "child_process";

import { Logger as log } from "../../utils/Logger";
import { BUILD_MESSAGE } from "../../config/constants";

import type { Framework } from "../../types/project";

const PRAMEWORK_PRESET: Record<
  Framework,
  { buildCommand: string; buildDirectory: string }
> = {
  CreateReactApp: {
    buildCommand: "npm run build",
    buildDirectory: "build",
  },
  ReactStatic: {
    buildCommand: "react-static build",
    buildDirectory: "dist",
  },
  NextJs: {
    buildCommand: "next build && next export",
    buildDirectory: ".next",
  },
  NuxtJs: {
    buildCommand: "nuxt generate",
    buildDirectory: "dist",
  },
  Angular: {
    buildCommand: "ng build",
    buildDirectory: "dist",
  },
  Astro: {
    buildCommand: "npm run build",
    buildDirectory: "dist",
  },
  Gatsby: {
    buildCommand: "gatsby build",
    buildDirectory: "public",
  },
  GitBook: {
    buildCommand: "gitbook build",
    buildDirectory: "_book",
  },
  Jekyll: {
    buildCommand: "jekyll build",
    buildDirectory: "_site",
  },
  Remix: {
    buildCommand: "npm run build",
    buildDirectory: "public",
  },
  Svelte: {
    buildCommand: "npm run build",
    buildDirectory: "public",
  },
  Vue: {
    buildCommand: "npm run build",
    buildDirectory: "public",
  },
  VuePress: {
    buildCommand: "vuepress build $directory",
    buildDirectory: "$directory/.vuepress/dist",
  },
};

type RunGitCloneOptions = {
  repoCloneUrl: string;
  repoName: string;
  framework: Framework;
  installCommand: string;
  buildCommand: string;
};

const runGitClone = async ({
  repoCloneUrl,
}: Pick<RunGitCloneOptions, "repoCloneUrl">) => {
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
}: Pick<RunGitCloneOptions, "installCommand" | "repoName">) => {
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
}: Pick<RunGitCloneOptions, "buildCommand" | "repoName">) => {
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
}: RunGitCloneOptions) {
  try {
    await runGitClone({ repoCloneUrl });

    await runDependenciesInstall({ repoName, installCommand });
    log.build(BUILD_MESSAGE.CREATE.COMPLETE_INSTALL_DEPENDENCIES);

    await runBuild({ repoName, buildCommand });
    log.build(BUILD_MESSAGE.CREATE.COMPLETE_RESOURCE_CREATE);

    const buildResourceLocation = `./buildResource/${repoName}/${PRAMEWORK_PRESET[framework].buildDirectory}`;

    return buildResourceLocation;
  } catch (error) {
    throw Error(BUILD_MESSAGE.CREATE_ERROR.FAIL_RESOURCE_CREATION);
  }
}
