import fs from "fs/promises";
import chalk from "chalk";

import Config from "../../config";
import Observer from "../BaseObserber";
import getFormattedKoreaTime from "./utils/getFormattedKoreaTime";

/*
 * how to use
 *
 * import log from "@src/services/Logger";
 *
 * log.build(logType, message, [...message]);
 *   ㄴ> Logs from project deployment
 *
 * log.debug(logType, message, [...message]);
 *   ㄴ> server log (ex: connect server, morgan log, etc..)
 */

export enum LogType {
  Server,
  Request,
  Deployment,
  Error,
}

export type LogMessage = string;

export class Logger extends Observer {
  /* logging handlers */
  private static console(logType: LogType, ...messages: LogMessage[]) {
    const messageHead = `[${getFormattedKoreaTime(new Date())}]`;

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

  private static async writefile(logType: LogType, ...messages: LogMessage[]) {
    const messageHead = `[${getFormattedKoreaTime(new Date())}]`;

    switch (logType) {
      case LogType.Server:
      case LogType.Request: {
        for (const message of messages) {
          await fs.appendFile(
            `logs/server.log`,
            `${messageHead} ${message} \n`,
          );
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

  private static notify(messageType: string, ...messages: LogMessage[]) {
    const messageHead = `[${getFormattedKoreaTime(new Date())}]`;

    for (const message of messages) {
      messageType === "error"
        ? Logger.send(`${messageHead} [ERROR] ${message}`)
        : Logger.send(`${messageHead} ${message}`);
    }
  }

  /* logging methods */
  static build(...messages: LogMessage[]) {
    if (Config.LOGGER_OPTIONS.debug) {
      Logger.console(LogType.Deployment, ...messages);
    }

    Logger.writefile(LogType.Deployment, ...messages);
    Logger.notify("build", ...messages);
  }

  static buildError(...messages: LogMessage[]) {
    Logger.writefile(LogType.Error, ...messages);
    Logger.writefile(LogType.Deployment, ...messages);
    Logger.notify("error", ...messages);
  }

  static debug(...messages: LogMessage[]) {
    Logger.writefile(LogType.Server, ...messages);
    Logger.console(LogType.Server, ...messages);
  }

  static error(...messages: LogMessage[]) {
    Logger.writefile(LogType.Error, ...messages);
    Logger.console(LogType.Error, ...messages);
  }

  static serverError(...messages: LogMessage[]) {
    Logger.writefile(LogType.Error, ...messages);
    Logger.console(LogType.Error, ...messages);
  }

  static request(...messages: LogMessage[]) {
    Logger.console(LogType.Request, ...messages);
  }
}
