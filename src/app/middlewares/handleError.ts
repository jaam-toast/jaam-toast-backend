import * as log from "../../@utils/log";
import {
  ValidateError,
  ForbiddenError,
  NotFoundError,
  UnknownError,
} from "../../@utils/defineErrors";

import type { ErrorRequestHandler } from "express";

export const handleError: ErrorRequestHandler = (error, req, res, next) => {
  log.serverError(
    `${error.name} - ${error.message} - ${req.originalUrl} - ${req.method} - ${req.ip} - ${error.stack}`,
  );

  if (error instanceof ValidateError) {
    return res.status(400).json({
      message: "error",
      result: error,
    });
  }
  if (error instanceof ForbiddenError) {
    return res.status(403).json({
      message: "error",
      result: error,
    });
  }
  if (error instanceof NotFoundError) {
    return res.status(404).json({
      message: "error",
      result: error,
    });
  }
  if (error instanceof UnknownError) {
    return res.status(500).json({
      message: "error",
      result: error,
    });
  }

  return res.status(error.status ?? 500).json({
    message: "error",
    result: error,
  });
};
