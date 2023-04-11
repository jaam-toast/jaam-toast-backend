import createError from "http-errors";
import { createHmac } from "crypto";

import Config from "@src/config";
import { Logger as log } from "@src/common/Logger";

import type { RequestHandler } from "express";

const verifyGithubSignature: RequestHandler = (req, res, next) => {
  const githubSignature = req.header("X-Hub-Signature-256");
  const event = req.header("X-GitHub-Event");
  const payload = req.body;

  log.build(
    `A POST request is received from Github webhook, and the event name is - ${event}`,
  );

  const hash = "sha256";
  const secretKey = Config.WEBHOOK_SECRET_KEY;

  const hmac = createHmac(hash, secretKey as string);

  const hmacResult = hmac.update(JSON.stringify(payload)).digest("hex");
  const calculatedSignature = "sha256=" + hmacResult;

  if (calculatedSignature !== githubSignature) {
    log.buildError(
      `Invalid hash from the request. It may not be the proper request received from Github webhook`,
    );
    next(
      createError(
        401,
        "The result of calculatedSignature and githubSignature from Github webhook doesn't match",
      ),
    );
  }

  log.build(
    `The result of calculatedSignature and githubSignature from Github webhook match properly`,
  );

  next();
};

export default verifyGithubSignature;
