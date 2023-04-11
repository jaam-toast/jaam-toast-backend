import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

const Config = {
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN!,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
  CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_API_KEY!,
  CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_EMAIL!,
};

export default Config;
