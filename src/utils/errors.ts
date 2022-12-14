export class DeploymentError extends Error {
  constructor(err: { code: string; message: string }) {
    super(err.message);
    this.code = err.code;
    this.name = "DeploymentError";
  }

  code: string;
}

export class CustomError extends Error {
  constructor(err: { code: string; message: string }) {
    super(err.message);
    this.code = err.code;
    this.name = "CustomError";
  }

  code: string;
}
