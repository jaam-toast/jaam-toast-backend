import express from "express";

import mongooseLoader from "@src/loaders/mongoose";
import dbWatcherLoader from "./loaders/dbWatcher";
import expressLoader from "@src/loaders/express";
import serverLoader from "@src/loaders/server";

import type { Express } from "express";

const app = express();

async function startServer(app: Express): Promise<void> {
  await mongooseLoader();

  await dbWatcherLoader();

  await expressLoader(app);

  await serverLoader(app);
}

startServer(app);
