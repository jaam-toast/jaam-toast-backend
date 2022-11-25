import { ErrorRequestHandler } from "express";
import Logger from "../../loaders/logger";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  if (err.name === "DeploymentError") {
    Logger.error(
      `${err.status || 500} - ${err.code} - ${err.message} - ${
        req.originalUrl
      } - ${req.method} - ${req.ip}`,
    );
  } else if (err.name === "CustomError") {
    Logger.error(
      `${err.status || 500} - ${err.code} - ${err.message} - ${
        req.originalUrl
      } - ${req.method} - ${req.ip}`,
    );
  } else {
    Logger.error(
      `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${
        req.method
      } - ${req.ip}`,
    );
  }

  res.status((err.status as number) || 500);
  res.json(err);
};

export default errorHandler;
