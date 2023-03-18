import express from "express";

import mongooseLoader from "@src/loaders/mongoose";
import expressLoader from "@src/loaders/express";
import serverLoader from "@src/loaders/server";
import socketLoader from "@src/loaders/socket";

import { Express } from "express";

const app = express();

async function startServer(app: Express): Promise<void> {
  await mongooseLoader();

  await expressLoader(app);

  const server = await serverLoader(app);

  await socketLoader(server);
}

startServer(app);
