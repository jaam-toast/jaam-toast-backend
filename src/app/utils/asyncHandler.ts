import type { NextFunction, Request, Response, RequestHandler } from "express";

export const asyncHandler = (asyncFunction: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await asyncFunction(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
