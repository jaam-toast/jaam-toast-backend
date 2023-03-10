import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "../routes";

import errorHandler from "../api/middlewares/errorHandler";

const expressLoader = (app: Express) => {
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

  app.use("/api", routes());

  app.use((req, res, next) => {
    res.sendStatus(404);
  });

  app.use(errorHandler);
};

export default expressLoader;
