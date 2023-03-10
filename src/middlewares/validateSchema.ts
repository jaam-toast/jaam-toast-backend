import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";
import createError from "http-errors";

import Logger from "../loaders/logger";

const validateSchema = (schema: ObjectSchema, property: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property as keyof typeof req]);

    if (error) {
      next(createError(400));
      Logger.error(error);
    }

    next();
  };
};

export default validateSchema;
