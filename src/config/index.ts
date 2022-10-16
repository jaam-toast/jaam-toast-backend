import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

const config = {
  DATABASE_URL: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};

export default config;
