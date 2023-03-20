import fs from "fs/promises";
import chalk from "chalk";

import Config from "../../config";
import Observer from "../Observer";
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

enum FileType {
  Deployment = "deployment.log",
  Server = "server.log",
  Error = "error.log",
}

type LogMessage = string;

class Logger extends Observer {
  /* logging handlers */
  private static commonLog(...messages: LogMessage[]) {
    const messageHead = `[${getFormattedKoreaTime(new Date())}]`;

    for (const message of messages) {
      process.stderr.write(
        [
          chalk.greenBright.bold("[COMMON]"),
          chalk.blackBright(messageHead),
          chalk.greenBright(message),
        ].join(" ") + "\n",
      );
    }
  }

  private static buildLog(...messages: LogMessage[]) {
    const messageHead = `[${getFormattedKoreaTime(new Date())}]`;

    for (const message of messages) {
      process.stderr.write(
        [
          chalk.cyanBright.bold("[BUILD]"),
          chalk.blackBright(messageHead),
          chalk.cyanBright(message),
        ].join(" ") + "\n",
      );
    }
  }

  private static errorLog(...messages: LogMessage[]) {
    const messageHead = `[${getFormattedKoreaTime(new Date())}]`;

    for (const message of messages) {
      process.stderr.write(
        [
          chalk.redBright.bold("[ERROR]"),
          chalk.redBright(messageHead),
          chalk.redBright(message),
        ].join(" ") + "\n",
      );
    }
  }

  private static async writefile(file: FileType, ...messages: LogMessage[]) {
    const messageHead = `[${getFormattedKoreaTime(new Date())}]`;

    for (const message of messages) {
      await fs.appendFile(`logs/${file}`, `${messageHead} ${message}`);
    }
  }

  private static notify(...messages: LogMessage[]) {
    const messageHead = `[${getFormattedKoreaTime(new Date())}]`;

    for (const message of messages) {
      Logger.send(`${messageHead} ${message}`);
    }
  }

  /* logging methods */
  static build(...messages: LogMessage[]) {
    if (Config.CLIENT_OPTIONS.debug) {
      Logger.buildLog(...messages);
    }

    Logger.writefile(FileType.Deployment, ...messages);
    Logger.notify(...messages);
  }

  static buildError(...messages: LogMessage[]) {
    if (Config.CLIENT_OPTIONS.debug) {
      Logger.errorLog(...messages);
    }

    Logger.writefile(FileType.Error, ...messages);
    Logger.notify(...messages);
  }

  static debug(...messages: LogMessage[]) {
    Logger.writefile(FileType.Server, ...messages);
    Logger.commonLog(...messages);
  }

  static serverError(...messages: LogMessage[]) {
    Logger.writefile(FileType.Error, ...messages);
    Logger.errorLog(...messages);
  }
}

export default Logger;
