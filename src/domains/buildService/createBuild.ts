import { spawn } from "child_process";

import log from "@src/common/Logger";
import { BUILD_COMPLETE_MESSAGE } from "@src/common/constants";
import Config from "@src/infrastructure/@config";
import { CloudFlare } from "@src/infrastructure/cloudFlare";

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
  childProcess.stdout?.on("data", data => {
    log.debug(data);
  });
  childProcess.stderr?.on("data", error => {
    log.buildError(error);
  });

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

export async function createBuild({
  buildResourceLocation,
  projectName,
}: Options) {
  const cloudflareApi = new CloudFlare({
    accountId: Config.CLOUDFLARE_ACCOUNT_ID,
    apiKey: Config.CLOUDFLARE_API_KEY,
    authEmail: Config.CLOUDFLARE_EMAIL,
  });

  log.build("Creating a project data...");

  const data = await cloudflareApi.createProject({ projectName });

  if (!data) {
    throw Error("Project creation failed.");
  }

  await createDeployment({ buildResourceLocation, projectName });
  const buildUrl = `https://${projectName}.pages.dev/`;

  log.build(BUILD_COMPLETE_MESSAGE);

  return buildUrl;
}
