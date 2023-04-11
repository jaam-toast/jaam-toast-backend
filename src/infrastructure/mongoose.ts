import mongoose from "mongoose";

import log from "@src/common/Logger";

export const connectDB = async (databaseUrl: string) => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(databaseUrl);

    log.debug("🌱 MongoDB connected!");
  } catch (error) {
    log.serverError("❌ MongoDB not connected!");

    throw error;
  }
};
