import { spawn } from "child_process";

import Config from "../../../config";
import DeployService from "..";
import getCerbotCommands from "../utils/getCerbotCommands";
import sleep from "../utils/sleep";

const createHttpsCertification = async (
  service: DeployService,
  next: Function,
): Promise<void> => {
  const { subdomain, instanceId } = service;

  if (!instanceId) {
    service.throw(
      "Cannot find instance id before creating HTTPS certification.",
    );
  }

  const controller = new AbortController();
  const { signal } = controller;

  service.buildLog(
    `letsencrypt - Plugins selected: Authenticator nginx, Installer nginx`,
    `Requesting a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}`,
  );

  await sleep(120000);

  try {
    const commands = getCerbotCommands(
      instanceId,
      `${subdomain}.${Config.SERVER_URL}`,
    );

    // TODO
    // * ssm -> ssh로 변경

    const ssmCertbotCommands = spawn("aws", commands, { signal });

    ssmCertbotCommands.stdout.on("data", data => {
      service.debugLog(
        `stdout data: ssmCertbotCommands - ${data}`,
        `Successfully requesting for a certificate through ssmCertbotCommands...`,
      );
    });

    ssmCertbotCommands.stderr.on("error", error => {
      service.throw("An error has occurred during HTTPS certification.", error);
    });

    ssmCertbotCommands.on("close", code => {
      service.buildLog(
        `A new certificate for ${subdomain}.${Config.SERVER_URL} has been requested.`,
      );
    });

    next();
  } catch (error) {
    controller.abort();

    service.throw(
      "An unexpected error occurred during creating github repository webhook",
      error,
    );
  }
};

export default createHttpsCertification;
