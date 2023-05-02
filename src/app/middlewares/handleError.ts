import * as log from "../../@utils/log";

import type { ErrorRequestHandler } from "express";

export const handleError: ErrorRequestHandler = (err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  log.serverError(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`,
  );

  res.status((err.status as number) || 500).json(err);
};
