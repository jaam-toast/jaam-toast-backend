import { User, DeploymentData } from "../custom";

export {};

declare global {
  namespace Express {
    export interface Request {
      user: User;
      deploymentData: DeploymentData;
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
