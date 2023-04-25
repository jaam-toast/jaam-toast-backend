import type { NextFunction, Request, Response, RequestHandler } from "express";

export const handleAsync = <
  RequestParamsType,
  RequestBodyType,
  RequestQueryType,
>(
  asyncFunction: RequestHandler<
    RequestParamsType,
    any,
    RequestBodyType,
    RequestQueryType
  >,
) => {
  return async (
    req: Request<RequestParamsType, any, RequestBodyType, RequestQueryType>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      await asyncFunction(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};
