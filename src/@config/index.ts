import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

const Config = {
  NODE_ENV: process.env.NODE_ENV!,
  ORIGIN_SERVER_URL: process.env.ORIGIN_SERVER_URL!,
  PRODUCTION_CLIENT_URL: process.env.PRODUCTION_CLIENT_URL!,
  LOGGER_OPTIONS: {
    debug: !!parseInt(process.env.DEBUG!),
  },
  CLIENT_LOCAL_URL: process.env.CLIENT_LOCAL_URL!,
  SERVER_URL: process.env.ORIGIN_SERVER_URL!,
  CLIENT_URL: process.env.CLIENT_URL!,
  SERVER_PORT: process.env.SERVER_PORT!,
  DATABASE_URL: process.env.MONGODB_URI!,
  APP_DB_NAME: process.env.APP_DB_NAME!,
  JWT_SECRET: process.env.JWT_SECRET_KEY!,
  STORAGE_JWT_SECRET: process.env.STORAGE_JWT_SECRET!,
  CONTENTS_DATABASE_URL: process.env.MONGODB_CONTENTS_URI!,
  JAAM_SERVER_DNS_NAME: process.env.AWS_JAAM_SERVER_DNS_NAME!,
  JAAM_ASSET_CDN_URL: process.env.AWS_CLOUDFRONT_ASSET_CDN_URL!,
  MAX_NUMBER_PER_PAGE: 20,
};

export default Config;
