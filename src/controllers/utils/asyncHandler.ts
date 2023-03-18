import { NextFunction, Request, Response, RequestHandler } from "express";
import Logger from "../../loaders/logger";

const catchAsync = (asyncFunction: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await asyncFunction(req, res, next);
    } catch (error) {
      Logger.error(error);

      next(error);
    }
  };
};

export default catchAsync;
