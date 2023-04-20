import mongoose from "mongoose";

import { mongodbContentsClient } from "./mongodbContentsClient";
import { Logger as log } from "../utils/Logger";

export async function connectDB(databaseUrl: string) {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(databaseUrl);
    await mongodbContentsClient.connect();

    log.debug("🌱 MongoDB connected!");
  } catch (error) {
    log.serverError("❌ MongoDB not connected!");

    throw error;
  }
}
