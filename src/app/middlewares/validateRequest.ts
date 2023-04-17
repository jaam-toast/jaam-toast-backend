import { ObjectSchema } from "joi";
import createError from "http-errors";

import { Logger as log } from "../../utils/Logger";

import type { Request, Response, NextFunction } from "express";

export const validateRequest = (schema: ObjectSchema, property: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property as keyof typeof req], {
      allowUnknown: true,
    });

    if (error) {
      log.serverError("Schema validation failed.");

      next(createError(400, error.message));
    }

    next();
  };
};
