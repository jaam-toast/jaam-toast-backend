import { injectable } from "inversify";
import { Server as SocketServer } from "socket.io";

import Config from "../@config";
import { subscribeEvent } from "../@utils/emitEvent";
import * as log from "../@utils/log";

import type { Server } from "http";

@injectable()
export class SocketClient {
  private static instance: SocketServer | null = null;

  public connect({ server }: { server: Server }) {
    SocketClient.instance = new SocketServer(server, {
      cors: {
        origin:
          Config.NODE_ENV === "production"
            ? [
                Config.CLIENT_URL,
                Config.PRODUCTION_CLIENT_URL,
                Config.ORIGIN_SERVER_URL,
              ]
            : Config.CLIENT_LOCAL_URL,
        credentials: true,
        methods: ["GET", "POST"],
      },
    });

    SocketClient.instance.on("connection", socket => {
      socket.on("get-building-log", socketProjectName => {
        log.debug(
          `Getting ready for sending a building log for ${socketProjectName}`,
        );

        socket.join(socketProjectName);

        log.subscribe(message => {
          const [projectName, buildMessage] = message.split("-");

          if (!buildMessage) {
            return;
          }
          if (projectName !== socketProjectName) {
            return;
          }

          socket.to(projectName).emit("new-building-log", message);
        });

        subscribeEvent(
          "DEPLOYMENT_UPDATED",
          ({ projectName, originalBuildDomain }, unsubscribe) => {
            if (projectName !== socketProjectName) {
              return;
            }

            socket.to(projectName).emit(
              "build-complete",
              JSON.stringify({
                originalBuildDomain,
              }),
            );
            unsubscribe();
          },
        );

        subscribeEvent(
          "DEPLOYMENT_ERROR",
          ({ projectName, error }, unsubscribe) => {
            if (projectName !== socketProjectName) {
              return;
            }

            socket.to(projectName).emit("build-error", error.message);
            unsubscribe();
          },
        );
      });
    });
  }

  public get server() {
    if (!SocketClient.instance) {
      throw new Error("An attempt was made to create more than one socket.");
    }

    return SocketClient.instance;
  }
}
