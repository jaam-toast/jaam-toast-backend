import winston from "winston";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
};

const chooseLevel = () => {
  const isDevelopment = process.env.NODE_ENV !== "production";

  return isDevelopment ? "debug" : "info";
};

const customColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "blue",
  debug: "white",
};

winston.addColors(customColors);

const Logger = winston.createLogger({
  level: chooseLevel(),
  levels,
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: "YYYY/MM/DD HH:mm:ss" }),
    winston.format.printf(
      ({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`,
    ),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

export default Logger;
