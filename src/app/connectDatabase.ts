import { MongodbContentClient } from "../infrastructure/MongodbContentClient";
import { MongodbDatabaseClient } from "../infrastructure/MongodbDatabaseClient";
import * as log from "../@utils/log";

export async function connectDatabase() {
  try {
    await MongodbDatabaseClient.connect();
    await MongodbContentClient.connect();

    log.debug("🌱 MongoDB connected!");
  } catch (error) {
    log.serverError("❌ MongoDB not connected!");

    throw error;
  }
}
