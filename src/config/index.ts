import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

const Config = {
  DATABASE_URL: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET_KEY,
  CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
};

export default Config;
