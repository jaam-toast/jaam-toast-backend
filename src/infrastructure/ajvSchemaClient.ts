import { injectable } from "inversify";
import Ajv from "ajv";

export type SchemaProperty = {
  type: string;
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  description?: string;
  format?: string;
};

export type Schema = {
  title: string;
  description?: string;
  type: "object";
  properties: Record<string, SchemaProperty>;
  required?: string[];
};

export interface SchemaClient {
  validateSchema: (validateSchemaOptions: { schema: Schema }) => boolean;
  validateData: (validateDataOptions: {
    schema: Schema;
    data: unknown;
  }) => boolean;
}

@injectable()
export class ajvSchemaClient implements SchemaClient {
  validateSchema({ schema }: { schema: Schema }) {
    const ajv = new Ajv();

    try {
      ajv.compile(schema);

      return true;
    } catch {
      return false;
    }
  }

  validateData({ schema, data }: { schema: Schema; data: unknown }) {
    const ajv = new Ajv();

    try {
      const validate = ajv.compile(schema);

      return validate(data);
    } catch {
      return false;
    }
  }
}
