import "reflect-metadata";
import "./subscribers";

import { createApp } from "./app/createApp";
import { connectDatabase } from "./app/connectDatabase";
import { createServer } from "./app/createServer";
import { createSocket } from "./app/createSocket";

async function startServer(): Promise<void> {
  const app = await createApp();
  const server = await createServer(app);

  await connectDatabase();
  await createSocket({ server });
}

startServer();
