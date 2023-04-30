export class BaseError<ErrorName extends string> extends Error {
  name: ErrorName;
  message: string;
  cause?: string;
  stack?: string;

  constructor({
    name,
    message,
    error,
  }: {
    name: ErrorName;
    message: string;
    error?: unknown;
  }) {
    super();
    this.name = name;
    this.message = message;

    if (error instanceof Error) {
      this.cause = error.message;
      this.stack = error.stack;
    }
  }
}
