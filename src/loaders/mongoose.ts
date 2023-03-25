import mongoose from "mongoose";

import Config from "@src/config";
import log from "@src/services/Logger";

const mongooseLoader = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(Config.DATABASE_URL);

    log.debug("🌱 MongoDB connected!");
  } catch (error) {
    log.serverError("❌ MongoDB not connected!");

    throw error;
  }
};

export default mongooseLoader;
