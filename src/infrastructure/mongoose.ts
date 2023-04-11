import mongoose from "mongoose";

import { Logger as log } from "@src/common/Logger";

export async function connectDB(databaseUrl: string) {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(databaseUrl);

    log.debug("🌱 MongoDB connected!");
  } catch (error) {
    log.serverError("❌ MongoDB not connected!");

    throw error;
  }
}
