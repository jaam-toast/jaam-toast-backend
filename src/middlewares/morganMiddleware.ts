import morgan from "morgan";
import log from "@src/services/Logger";

import { StreamOptions } from "morgan";

const stream: StreamOptions = {
  write: message => log.debug(message),
};

const skip = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return !isDevelopment;
};

const requestLogger = morgan(
  ":method :url :status :res[content-length] - :response-time ms",
  { stream, skip },
);

export default requestLogger;
