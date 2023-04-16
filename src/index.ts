import "reflect-metadata";

import { createApp } from "./app/createApp";
import { createServer } from "./app/createServer";
import { createSocket } from "./app/createSocket";
import { connectDB } from "./infrastructure/mongoose";
import Config from "./config";

async function startServer(): Promise<void> {
  const app = await createApp();

  await connectDB(Config.DATABASE_URL);
  const server = await createServer(app);
  await createSocket({ server, clientOrigin: Config.CLIENT_URL });
}

startServer();
