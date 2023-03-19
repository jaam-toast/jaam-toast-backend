import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import createError from "http-errors";

import log from "@src/services/Logger";

const validateSchema = (schema: ObjectSchema, property: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property as keyof typeof req]);

    if (error) {
      log.serverError("Schema validation faild.");

      next(createError(400, error.message));
    }

    next();
  };
};

export default validateSchema;
