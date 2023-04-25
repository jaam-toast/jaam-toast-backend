import { ZodError, ZodSchema } from "zod";
import createError from "http-errors";

import type { RequestHandler } from "express";

export function parseRequest<
  RequestParamsType = unknown,
  RequestBodyType = unknown,
  RequestQueryType = unknown,
>(schema: {
  params?: ZodSchema<RequestParamsType>;
  body?: ZodSchema<RequestBodyType>;
  query?: ZodSchema<RequestQueryType>;
}): RequestHandler<RequestParamsType, any, RequestBodyType, RequestQueryType> {
  return (req, res, next) => {
    try {
      if (schema.body) {
        schema.body.parseAsync(req.body);
      }
    } catch (error) {
      // TODO: error message
      if (error instanceof ZodError) {
        next(createError(400, "Request body validation failed."));
      }
    }

    try {
      if (schema.params) {
        schema.params.parseAsync(req.params);
      }
    } catch (error) {
      // TODO: error message
      if (error instanceof ZodError) {
        next(createError(400, "Request path Variables validation failed."));
      }
    }

    try {
      if (schema.query) {
        schema.query.parseAsync(req.query);
      }
    } catch (error) {
      // TODO: error message
      if (error instanceof ZodError) {
        next(createError(400, "Request Query params validation failed."));
      }
    }

    return next();
  };
}
