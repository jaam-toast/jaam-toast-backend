import { RequestHandler } from "express";
import { createHmac } from "crypto";

import Config from "../../config";

import { DeploymentError } from "../../utils/errors";
import { createBuildingLogDebug } from "../../utils/createDebug";

const verifyGithubSignature: RequestHandler = (req, res, next) => {
  const debug = createBuildingLogDebug(Config.CLIENT_OPTIONS.debug);

  const githubSignature = req.header("X-Hub-Signature-256");
  const eventName = req.header("X-GitHub-Event");
  const payload = req.body;

  debug(
    `A POST request is received from Github webhook, and the event name is - ${eventName}`,
  );

  const hash = "sha256";
  const secretKey = Config.WEBHOOK_SECRET_KEY;

  const hmac = createHmac(hash, secretKey as string);

  const hmacResult = hmac.update(JSON.stringify(payload)).digest("hex");
  const calculatedSignature = "sha256=" + hmacResult;

  if (calculatedSignature !== githubSignature) {
    debug(
      `Invalid hash from the request. It may not be the proper request received from Github webhook`,
    );
    throw new DeploymentError({
      code: "github-webhook_verifyGithubSignature",
      message:
        "The result of calculatedSignature and githubSignature from Github webhook doesn't match",
    });
  }

  debug(
    `The result of calculatedSignature and githubSignature from Github webhook match properly`,
  );

  next();
};

export default verifyGithubSignature;
