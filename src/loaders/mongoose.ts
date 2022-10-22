import mongoose from "mongoose";
import Config from "../config";

const mongooseLoader = async () => {
  try {
    const { connection } = await mongoose.connect(Config.DATABASE_URL);

    return connection.db;
  } catch (error) {
    console.error(error);
  }
};

export default mongooseLoader;
