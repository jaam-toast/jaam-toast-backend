import { User } from "@src/types/db";

declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }

  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string;
      JWT_SECRET_KEY: string;
      GITHUB_CLIENT_ID: string;
      GITHUB_CLIENT_SECRET: string;
    }
  }
}
