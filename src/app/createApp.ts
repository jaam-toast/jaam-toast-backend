import express from "express";
import cors from "cors";
import helmet from "helmet";

import { logRequest } from "./middlewares/logRequest";
import { handleError } from "./middlewares/handleError";
import { router } from "./routes";

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
  app.use(logRequest);

  app.use("/api", router);

  app.use((req, res, next) => {
    res.sendStatus(404);
  });

  app.use(handleError);

  return app;
};
