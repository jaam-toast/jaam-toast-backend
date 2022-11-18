import * as fs from "fs";
import { Socket } from "socket.io";

import Config from "../../config";
import { socketIO } from "../../bin/www";

import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";

export default async function bulidingLogSocket() {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);

  const io = socketIO.getInstance();

  io.on("connection", (socket: Socket) => {
    socket.on("connection", () => {
      debug(
        "Socket is connected in order to send back to client the newly created deployment buliding log",
      );
    });

    socket.on("get-building-log", repoName => {
      debug(`Getting ready for sending a buliding log for ${repoName}`);
    });

    let prevData: string;

    fs.watch("logs/bulidtime.log", (eventType, fileName) => {
      fs.readFile(`logs/${fileName}`, "utf8", (err, data) => {
        if (err) {
          throw new DeploymentError({
            code: "socketBulidtimeLog",
            message: `Error: An unexpected error occurred during socketBulidtimeLog - ${err}`,
          });
        }

        if (prevData === data) {
          return () => {};
        }

        prevData = data;

        socket.emit("new-building-log", data);
      });
    });
  });
}
