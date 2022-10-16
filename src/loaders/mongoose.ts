import mongoose from "mongoose";
import config from "../config";

const mongooseLoader = async () => {
  try {
    const { connection } = await mongoose.connect(config.DATABASE_URL!);

    return connection.db;
  } catch (error) {
    console.error(error);
  }
};

export default mongooseLoader;
