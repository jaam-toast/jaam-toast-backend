import express from "express";
import cors from "cors";
import helmet from "helmet";

import requestLogger from "@src/app/middlewares/morganMiddleware";
import errorHandler from "@src/app/middlewares/errorHandler";
import routes from "@src/app/routes";

import type { Express } from "express";

export const createApp = async (): Promise<Express> => {
  const app = express();

  app.get("/status", (req, res) => {
    res.status(200).end();
  });
  app.head("/status", (req, res) => {
    res.status(200).end();
  });

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cors());
  app.use(helmet());
  app.use(requestLogger);

  app.use("/api", routes());

  app.use((req, res, next) => {
    res.sendStatus(404);
  });

  app.use(errorHandler);

  return app;
};
