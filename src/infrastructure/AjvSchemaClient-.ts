import { injectable } from "inversify";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import type { SchemaClient } from "../@config/di.config";
import type { Schema } from "../@types/schema";

@injectable()
export class AjvSchemaClient implements SchemaClient {
  validateSchema({ schema }: { schema: Schema }) {
    const ajv = new Ajv();
    addFormats(ajv);

    try {
      ajv.compile(schema);

      return true;
    } catch {
      return false;
    }
  }

  validateData({ schema, data }: { schema: Schema; data: unknown }) {
    const ajv = new Ajv();
    addFormats(ajv);

    try {
      const validate = ajv.compile(schema);

      return validate(data);
    } catch {
      return false;
    }
  }
}
