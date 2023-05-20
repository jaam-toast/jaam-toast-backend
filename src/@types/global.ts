import type { Request } from "express-serve-static-core";

export {};

declare global {
  namespace Express {
    export interface Request {
      cookie: {
        githubAccessToken: string;
        accessToken: string;
        userId: string;
      };
    }
  }
}
