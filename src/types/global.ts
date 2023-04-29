import { User } from "./user";

declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}
