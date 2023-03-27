import express from "express";
import cors from "cors";
import helmet from "helmet";

import requestLogger from "../middlewares/morganMiddleware";
import errorHandler from "../middlewares/errorHandler";
import routes from "../routes";

import type { Express } from "express";

const expressLoader = async (app: Express): Promise<void> => {
  app.get("/status", (req, res) => {
    res.status(200).end();
  });
  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // TODO cors
  app.use(cors());
  app.use(helmet());
  app.use(requestLogger);

  app.use("/api", routes());

  app.use((req, res, next) => {
    res.sendStatus(404);
  });

  app.use(errorHandler);
};

export default expressLoader;
