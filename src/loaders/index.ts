import { Express } from "express";
import mongooseLoader from "./mongoose";
import expressLoader from "./express";

import Logger from "./logger";

const loaders = async (app: Express) => {
  await mongooseLoader();
  Logger.info("🌱 MongoDB connected!");

  await expressLoader(app);
  Logger.info("🌲 Express loaded!");
};

export default loaders;
