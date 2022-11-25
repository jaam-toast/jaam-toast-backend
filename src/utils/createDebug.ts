import * as fs from "fs";

import chalk from "chalk";

export function createDeploymentDebug(debug: boolean) {
  if (debug) {
    return (...logs: string[]) => {
      const dayTime = new Date().toISOString();
      const formattedTime = `${dayTime.split("T")[0]} ${
        dayTime.split("T")[1].split(".")[0]
      }.${dayTime.split(".")[1].split("Z")[0]}`;

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

          fs.write(fd, `[deployment] ${formattedTime} ${log}` + "\n", err => {
            if (err) throw Error(err.message);
          });
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
      }.${dayTime.split(".")[1].split("Z")[0]}`;

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

          fs.write(fd, `[certbot] ${formattedTime} ${log}` + "\n", err => {
            if (err) throw Error(err.message);
          });
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
      }.${dayTime.split(".")[1].split("Z")[0]}`;

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

          fs.write(fd, `[building-log] ${formattedTime} ${log}` + "\n", err => {
            if (err) throw Error(err.message);
          });
        });
      });
    };
  }

  return () => {};
}

export function createGeneralLogDebug(debug?: boolean) {
  if (debug) {
    return (...logs: string[]) => {
      const dayTime = new Date().toISOString();
      const formattedTime = `${dayTime.split("T")[0]} ${
        dayTime.split("T")[1].split(".")[0]
      }.${dayTime.split(".")[1].split("Z")[0]}`;

      process.stderr.write(
        [
          chalk.redBright.bold("[general-log-debug]"),
          chalk.blackBright(`${formattedTime}`),
          ...logs,
        ].join(" ") + "\n",
      );

      fs.open("logs/bulidtime.log", "w", (err, fd) => {
        if (err) throw Error(err.message);

        logs.forEach(log => {
          // process.stderr.write(log + " " + "\n");

          fs.write(fd, `[general-log] ${formattedTime} ${log}` + "\n", err => {
            if (err) throw Error(err.message);
          });
        });
      });
    };
  }

  return () => {};
}
