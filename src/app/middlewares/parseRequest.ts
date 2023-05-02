import { ZodError, ZodSchema, z } from "zod";
import createError from "http-errors";

import type { RequestHandler } from "express";

export function parseRequest<
  RequestParamsType extends ZodSchema = z.ZodUnknown,
  RequestBodyType extends ZodSchema = z.ZodUnknown,
  RequestQueryType extends ZodSchema = z.ZodUnknown,
>(schema: {
  params?: RequestParamsType;
  body?: RequestBodyType;
  query?: RequestQueryType;
}): RequestHandler<
  z.output<RequestParamsType>,
  any,
  z.output<RequestBodyType>,
  z.output<RequestQueryType>
> {
  return (req, res, next) => {
    try {
      if (schema.body) {
        schema.body.parse(req.body);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return next(createError(400, "Request body validation failed."));
      }
    }

    try {
      if (schema.params) {
        schema.params.parse(req.params);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          createError(400, "Request path Variables validation failed."),
        );
      }
    }

    try {
      if (schema.query) {
        schema.query.parse(req.query);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return next(
          createError(400, "Request Query params validation failed."),
        );
      }
    }

    return next();
  };
}
