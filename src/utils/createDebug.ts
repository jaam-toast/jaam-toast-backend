import * as fs from "fs";

import chalk from "chalk";

export function createDeploymentDebug(debug: boolean) {
  if (debug) {
    return (...logs: string[]) => {
      const dayTime = new Date().toISOString();
      const formattedTime = `${dayTime.split("T")[0]} ${
        dayTime.split("T")[1].split(".")[0]
      }`;

      process.stderr.write(
        [
          chalk.cyanBright.bold("[deployment-debug]"),
          chalk.blackBright(`${formattedTime}`),
          ...logs,
        ].join(" ") + "\n",
      );

      fs.open("logs/bulidtime.log", "w", (err, fd) => {
        if (err) throw Error(err.message);

        logs.forEach(log => {
          // process.stderr.write(log + " " + "\n");

          fs.write(
            fd,
            `${chalk.cyanBright.bold(
              "[jaamtoast-deployment]",
            )} ${chalk.blackBright(`${formattedTime}`)} ${log}` + "\n",
            err => {
              if (err) throw Error(err.message);
            },
          );
        });
      });
    };
  }

  return () => {};
}

export function createCertbotDebug(debug?: boolean) {
  if (debug) {
    return (...logs: string[]) => {
      const dayTime = new Date().toISOString();
      const formattedTime = `${dayTime.split("T")[0]} ${
        dayTime.split("T")[1].split(".")[0]
      }`;

      process.stderr.write(
        [
          chalk.yellowBright.bold("[certbot-debug]"),
          chalk.blackBright(`${formattedTime}`),
          ...logs,
        ].join(" ") + "\n",
      );

      fs.open("logs/bulidtime.log", "w", (err, fd) => {
        if (err) throw Error(err.message);

        logs.forEach(log => {
          // process.stderr.write(log + " " + "\n");

          fs.write(
            fd,
            `${chalk.yellowBright.bold(
              `[jaamtoast-certbot]`,
            )} ${chalk.blackBright(`${formattedTime}`)} ${log}` + "\n",
            err => {
              if (err) throw Error(err.message);
            },
          );
        });
      });
    };
  }

  return () => {};
}

export function createBuildingLogDebug(debug?: boolean) {
  if (debug) {
    return (...logs: string[]) => {
      const dayTime = new Date().toISOString();
      const formattedTime = `${dayTime.split("T")[0]} ${
        dayTime.split("T")[1].split(".")[0]
      }`;

      process.stderr.write(
        [
          chalk.greenBright.bold("[building-log-debug]"),
          chalk.blackBright(`${formattedTime}`),
          ...logs,
        ].join(" ") + "\n",
      );

      fs.open("logs/bulidtime.log", "w", (err, fd) => {
        if (err) throw Error(err.message);

        logs.forEach(log => {
          // process.stderr.write(log + " " + "\n");

          fs.write(
            fd,
            `${chalk.yellowBright.bold(
              "[jaamtoast-building-log]",
            )} ${chalk.blackBright(`${formattedTime}`)} ${log}` + "\n",
            err => {
              if (err) throw Error(err.message);
            },
          );
        });
      });
    };
  }

  return () => {};
}
