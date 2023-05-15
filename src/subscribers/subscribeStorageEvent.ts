import { container } from "../@config/di.config";
import { subscribeEvent } from "../@utils/emitEvent";

import type { StorageService } from "../domains/StorageService";

const storageService = container.get<StorageService>("StorageService");

subscribeEvent("CREATE_PROJECT", async ({ projectName }) => {
  await storageService.createStorageDomain({ projectName });
});
