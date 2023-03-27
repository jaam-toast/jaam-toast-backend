import express from "express";

import expressLoader from "./loaders/express";
import serverLoader from "./loaders/server";
import socketLoader from "./loaders/socket";

import type { Express } from "express";

const app = express();

async function startServer(app: Express): Promise<void> {
  await expressLoader(app);

  const server = await serverLoader(app);

  await socketLoader(server);
}

startServer(app);
