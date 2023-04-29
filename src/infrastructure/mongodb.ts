import { MongodbContentsClient } from "./mongodbContentsClient";
import { MongodbDatabaseClient } from "./mongodbDatabaseClient";
import { Logger as log } from "../@utils/Logger";

export async function connectDB(databaseUrl: string) {
  try {
    await MongodbDatabaseClient.connect();
    await MongodbContentsClient.connect();

    log.debug("🌱 MongoDB connected!");
  } catch (error) {
    log.serverError("❌ MongoDB not connected!");

    throw error;
  }
}
