import { spawn } from "child_process";

import { Logger as log } from "../../common/Logger";
import { BUILD_COMPLETE_MESSAGE } from "../../common/constants";
import Config from "../../infrastructure/@config";
import { CloudFlare } from "../../infrastructure/cloudFlare";

type Options = {
  buildResourceLocation: string;
  projectName: string;
};

const createDeployment = async ({
  buildResourceLocation,
  projectName,
}: Options) => {
  const command = [
    `CLOUDFLARE_ACCOUNT_ID=${Config.CLOUDFLARE_ACCOUNT_ID} CLOUDFLARE_API_TOKEN=${Config.CLOUDFLARE_API_TOKEN} npx wrangler pages publish ${buildResourceLocation} --project-name ${projectName} --branch main`,
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

export async function createBuildProject({
  buildResourceLocation,
  projectName,
}: Options) {
  log.build("Creating a project data...");

  const cloudflare = new CloudFlare();
  const data = await cloudflare.createProject({ projectName });

  if (!data) {
    throw Error("Project creation failed.");
  }

  await createDeployment({ buildResourceLocation, projectName });
  const buildUrl = `https://${projectName}.pages.dev/`;

  log.build(BUILD_COMPLETE_MESSAGE);

  return buildUrl;
}
