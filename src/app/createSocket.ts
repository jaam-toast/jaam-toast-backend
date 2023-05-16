import { container } from "../@config/di.config";
import { SocketClient } from "../infrastructure/SocketClient";
import * as log from "../@utils/log";

import type { Server } from "http";

export const createSocket = async ({
  server,
}: {
  server: Server;
}): Promise<void> => {
  const socketClient = container.get<SocketClient>("SocketClient");

  try {
    socketClient.connect({
      server,
    });

    log.debug("🚀 A new socket instance is created");
  } catch (error) {
    log.serverError("❌ Socket creation failed.");
  }
};
