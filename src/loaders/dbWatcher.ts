import { MongoClient } from "mongodb";

import Config from "@src/config";
import log from "@src/services/Logger";
import {
  projectWatchFields,
  insertWatch,
  updateWatch,
  deleteWatch,
} from "@src/controllers/projectWatcher";

import { StreamType } from "@src/types/db";

const dbWatcherLoader = async (): Promise<void> => {
  const client = new MongoClient(Config.DATABASE_URL);
  const collection = client.db("test").collection("projects");

  const projectStream = collection.watch(
    [
      {
        $match: {
          $or: [
            { operationType: "insert" },
            {
              $and: [
                { operationType: "update" },
                {
                  $or: projectWatchFields.map(option => {
                    return {
                      [`updateDescription.updatedFields.${option}`]: {
                        $exists: true,
                      },
                    };
                  }),
                },
              ],
            },
          ],
        },
      },
    ],
    { fullDocument: "updateLookup" },
  );

  log.debug("👀 DB watcher connected!");

  projectStream.on("change", async (stream: StreamType) => {
    if (!stream || !stream.fullDocument) {
      throw Error("The data is incorrect.");
    }

    switch (stream.operationType) {
      case "insert": {
        await insertWatch(stream);

        break;
      }
      case "update": {
        const { status: projectStatus } = stream.fullDocument;

        projectStatus === "deleting"
          ? await deleteWatch(stream)
          : await updateWatch(stream);

        break;
      }
      default: {
        throw Error("Does not conform to the specified format.");
      }
    }
  });

  projectStream.on("error", (error?: unknown) => {
    log.serverError("👁️👁️ DB watcher error!");

    throw error;
  });
};

export default dbWatcherLoader;
