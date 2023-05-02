import fs from "fs/promises";
import chalk from "chalk";

import Config from "../@config";

export enum LogType {
  Server,
  Request,
  Deployment,
  Error,
}

export type LogMessage = string;

/**
 * observer methods
 */

let subscriber: (message: string) => void = () => {};

export function subscribe(fn: (message: string) => void) {
  subscriber = fn;
}

export function unsubscribe() {
  subscriber = () => {};
}

function send(message: string) {
  subscriber(message);
}

/**
 * logging handlers
 */

function console(logType: LogType, ...messages: LogMessage[]) {
  const messageHead = `[${new Date().toISOString()}]`;

  switch (logType) {
    case LogType.Server: {
      for (const message of messages) {
        process.stdout.write(
          [
            chalk.greenBright.bold("[COMMON]"),
            chalk.blackBright(messageHead),
            chalk.greenBright(message),
          ].join(" ") + "\n",
        );
      }

      break;
    }
    case LogType.Request: {
      for (const message of messages) {
        process.stdout.write(
          [
            chalk.magentaBright.bold("[REQUEST]"),
            chalk.blackBright(messageHead),
            chalk.magentaBright(message),
          ].join(" ") + "\n",
        );
      }

      break;
    }
    case LogType.Deployment: {
      for (const message of messages) {
        process.stdout.write(
          [
            chalk.hex("#EE9560").bold("[BUILD]"),
            chalk.blackBright(messageHead),
            chalk.hex("#EE9560")(message),
          ].join(" ") + "\n",
        );
      }

      break;
    }
    case LogType.Error: {
      for (const message of messages) {
        process.stderr.write(
          [
            chalk.redBright.bold("[ERROR]"),
            chalk.redBright(messageHead),
            chalk.redBright.bold(message),
          ].join(" ") + "\n",
        );
      }

      break;
    }
    default: {
      break;
    }
  }
}

async function writefile(logType: LogType, ...messages: LogMessage[]) {
  const messageHead = `[${new Date().toISOString()}]`;

  switch (logType) {
    case LogType.Server:
    case LogType.Request: {
      for (const message of messages) {
        await fs.appendFile(`logs/server.log`, `${messageHead} ${message} \n`);
      }
    }
    case LogType.Deployment: {
      for (const message of messages) {
        await fs.appendFile(
          `logs/deployment.log`,
          `${messageHead} ${message} \n`,
        );
      }
    }
    case LogType.Error: {
      for (const message of messages) {
        await fs.appendFile(`logs/error.log`, `${messageHead} ${message} \n`);
      }
    }
    default: {
      break;
    }
  }
}

function notify(messageType: string, ...messages: LogMessage[]) {
  for (const message of messages) {
    messageType === "error" ? send(`[ERROR] ${message}`) : send(message);
  }
}

/**
 * logging methods
 */
export function build(...messages: LogMessage[]) {
  if (Config.LOGGER_OPTIONS.debug) {
    console(LogType.Deployment, ...messages);
  }

  writefile(LogType.Deployment, ...messages);
  notify("build", ...messages);
}

export function buildError(...messages: LogMessage[]) {
  writefile(LogType.Error, ...messages);
  writefile(LogType.Deployment, ...messages);
  notify("error", ...messages);
}

export function debug(...messages: LogMessage[]) {
  writefile(LogType.Server, ...messages);
  console(LogType.Server, ...messages);
}

export function serverError(...messages: LogMessage[]) {
  writefile(LogType.Error, ...messages);
  console(LogType.Error, ...messages);
}
