import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

const Config = {
  DATABASE_URL: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET_KEY,
  CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  INSTANCE_TYPE: process.env.AWS_INSTANCE_TYPE,
  AMI_ID: process.env.AWS_AMI_ID,
  KEY_PAIR_NAME: process.env.AWS_KEY_PAIR_NAME,
  IAM_INSTANCE_PROFILE: process.env.AWS_IAM_INSTANCE_PROFILE,
  NODEJS_FERMIUM: "14.21.0",
  NODEJS_GALLIUM: "16.18.0",
};

export default Config;
