import { NextFunction, Request, Response, RequestHandler } from "express";

const catchAsync = (asyncFunction: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await asyncFunction(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default catchAsync;
