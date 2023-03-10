import morgan, { StreamOptions } from "morgan";
import Logger from "../loaders/logger";

const stream: StreamOptions = {
  write: message => Logger.http(message),
};

const skip = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return !isDevelopment;
};

const morganMiddleware = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip },
);

export default morganMiddleware;
