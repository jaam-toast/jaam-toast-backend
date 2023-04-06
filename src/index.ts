import { createApp } from "./app/createApp";
import { connectMongoose } from "./app/connectMongoose";
import { createServer } from "./app/createServer";

async function startServer(): Promise<void> {
  const app = await createApp();

  await connectMongoose();
  await createServer(app);
}

startServer();
