import { createApp } from "./app/createApp";
import { createServer } from "./app/createServer";
import { connectDB } from "./infrastructure/mongooseService";
import { createSocket } from "./infrastructure/SocketService";
import Config from "./config";

async function startServer(): Promise<void> {
  const app = await createApp();

  await connectDB(Config.DATABASE_URL);
  const server = await createServer(app);
  await createSocket(server);
}

startServer();
