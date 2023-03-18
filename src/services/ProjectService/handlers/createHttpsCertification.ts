import { spawn } from "child_process";

import Config from "@src/config";
import log from "@src/services/Logger";
import getCerbotCommands from "../utils/getCerbotCommands";
import sleep from "../utils/sleep";

import ProjectService from "@src/services/ProjectService";

const createHttpsCertification = async (
  service: ProjectService,
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

  log.build(
    `letsencrypt - Plugins selected: Authenticator nginx, Installer nginx`,
    `Requesting a certificate to enable HTTPS on ${subdomain}.${Config.SERVER_URL}`,
  );

  await sleep(120000);

  try {
    const commands = getCerbotCommands(
      instanceId,
      `${subdomain}.${Config.SERVER_URL}`,
    );
    const ssmCertbotCommands = spawn("aws", commands, { signal });

    ssmCertbotCommands.stdout.on("data", data => {
      log.debug(
        `stdout data: ssmCertbotCommands - ${data}`,
        `Successfully requesting for a certificate through ssmCertbotCommands...`,
      );
    });

    ssmCertbotCommands.stderr.on("data", data => {
      service.throw("An error has occurred during HTTPS certification.", data);
    });

    ssmCertbotCommands.stderr.on("error", error => {
      service.throw("An error has occurred during HTTPS certification.", error);
    });

    ssmCertbotCommands.on("close", code => {
      log.build(
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
