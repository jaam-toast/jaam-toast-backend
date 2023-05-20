import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import Config from "../@config";
import { logRequest } from "./middlewares/logRequest";
import { handleError } from "./middlewares/handleError";
import { router as apiRouter } from "./routes";
import { storageRouter } from "./routes/routeStorage";

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
  app.use(
    "/api",
    cors({
      origin:
        Config.NODE_ENV === "production"
          ? [
              Config.CLIENT_URL,
              Config.PRODUCTION_CLIENT_URL,
              Config.ORIGIN_SERVER_URL,
            ]
          : Config.CLIENT_LOCAL_URL,
      credentials: true,
    }),
  );
  app.use("/api/storage", cors());
  app.use(cookieParser());
  app.use(helmet());
  app.use(logRequest);

  app.use("/api/storage", storageRouter);
  app.use("/api", apiRouter);

  app.use((req, res, next) => {
    res.sendStatus(404);
  });

  app.use(handleError);

  return app;
};
