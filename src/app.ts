import express from "express";
import loaders from "./loaders";

const app = express();

async function startServer() {
  await loaders(app);
}
startServer();

export default app;
