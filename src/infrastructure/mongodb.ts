import { mongodbContentsClient } from "./mongodbContentsClient";
import { Logger as log } from "../utils/Logger";
import { mongodbDatabaseClient } from "./mongodbDatabaseClient";

export async function connectDB(databaseUrl: string) {
  try {
    await mongodbDatabaseClient.connect();
    await mongodbContentsClient.connect();

    log.debug("🌱 MongoDB connected!");
  } catch (error) {
    log.serverError("❌ MongoDB not connected!");

    throw error;
  }
}
