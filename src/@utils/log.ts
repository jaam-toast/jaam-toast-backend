import fs from "fs/promises";
import chalk from "chalk";
import { nanoid } from "nanoid";

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

const subscribers: Record<
  string,
  | {
      subscribeId: string;
      logCallback: (message: string) => void;
    }[]
  | undefined
> = {};

function subscribe(
  name: string,
  logCallback: (message: string) => void,
): string {
  const subscribeId = nanoid();
  const logSubscribers = subscribers[name];

  if (Array.isArray(logSubscribers)) {
    logSubscribers.push({
      subscribeId,
      logCallback,
    });
  } else {
    subscribers[name] = [
      {
        subscribeId,
        logCallback,
      },
    ];
  }

  return subscribeId;
}

function unsubscribe(name: string, subscribeId: string): void {
  const logSubscribers = subscribers[name];

  if (!logSubscribers) {
    return;
  }

  subscribers[name] = logSubscribers.filter(
    subscriber => subscriber.subscribeId !== subscribeId,
  );
}

function send(name: string, messages: string[]) {
  const logSubscribers = subscribers[name];

  if (!logSubscribers) {
    return;
  }

  for (const subscriber of logSubscribers) {
    for (const message of messages) {
      subscriber.logCallback(message);
    }
  }
}

export const emitter = {
  of: (name: string) => ({
    send: (...messages: string[]) => {
      send(name, messages);
    },
    subscribe: (logCallback: (message: string) => void) => {
      return subscribe(name, logCallback);
    },
    unsubscribe: (subscribeId: string) => {
      unsubscribe(name, subscribeId);
    },
  }),
};

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

/**
 * logging methods
 */
export function build(projectName: string, ...messages: LogMessage[]) {
  const buildMessages = messages.map(message => `[${projectName}] ${message}`);

  if (Config.LOGGER_OPTIONS.debug) {
    console(LogType.Deployment, ...buildMessages);
  }

  writefile(LogType.Deployment, ...buildMessages);
  emitter.of(projectName).send(...messages);
}

export function debug(...messages: LogMessage[]) {
  writefile(LogType.Server, ...messages);
  console(LogType.Server, ...messages);
}

export function serverError(...messages: LogMessage[]) {
  writefile(LogType.Error, ...messages);
  console(LogType.Error, ...messages);
}
