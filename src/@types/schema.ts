export type Schema = {
  title: string;
  description?: string;
  type: "object";
  properties: Record<
    string,
    {
      type: string;
      minLength?: number;
      maxLength?: number;
      minimum?: number;
      maximum?: number;
      description?: string;
      format?: string;
    }
  >;
  required?: string[];
};
