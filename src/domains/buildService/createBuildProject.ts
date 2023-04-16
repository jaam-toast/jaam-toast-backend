import { spawn } from "child_process";

import { Logger as log } from "../../util/Logger";
import { CloudFlare } from "../../infrastructure/cloudFlare";
import { BUILD_MESSAGE } from "src/config/constants";

type Options = {
  buildResourceLocation: string;
  projectName: string;
};

const createDeployment = async ({
  buildResourceLocation,
  projectName,
}: Options) => {
  const cloudFlare = new CloudFlare();
  const command = [
    cloudFlare.makePublishPageCommand({ buildResourceLocation, projectName }),
    "rm -rf buildResource",
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

  await new Promise<number>((resolve, reject) => {
    childProcess.on("exit", (code: number) => {
      if (code === null) {
        log.error(
          `publish cloud flare page ${BUILD_MESSAGE.CHILD_PROCESS_EXITED_WITH_CODE} null`,
        );
      }

      log.debug(
        `publish cloud flare page ${BUILD_MESSAGE.CHILD_PROCESS_EXITED_WITH_CODE} ${code}`,
      );

      resolve(code || 0);
    });
  });

  log.debug("Cloning complete.");
};

export async function createBuildProject({
  buildResourceLocation,
  projectName,
}: Options) {
  try {
    log.build(BUILD_MESSAGE.WORKING_ON_BUILD_PROJECT);

    const cloudFlareApi = new CloudFlare();
    const { result } = await cloudFlareApi.createProject({
      projectName: projectName,
    });

    if (result.success === false) {
      throw new Error(BUILD_MESSAGE.ERROR.FAIL_PROJECT_CREATION);
    }

    const buildOriginalDomain: string = result.subdomain;
    await createDeployment({ buildResourceLocation, projectName });

    return buildOriginalDomain;
  } catch (error) {
    throw new Error(BUILD_MESSAGE.ERROR.FAIL_PROJECT_CREATION);
  }
}
