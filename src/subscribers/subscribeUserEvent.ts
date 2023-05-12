import { container } from "../@config/di.config";
import { subscribeEvent } from "../@utils/emitEvent";

import type { User } from "../@types/user";
import type { Repository } from "../@config/di.config";

const userRepository = container.get<Repository<User>>("UserRepository");

subscribeEvent("CREATE_PROJECT", async ({ userId, projectName }) => {
  const [user] = await userRepository.readDocument({ documentId: userId });

  if (!user) {
    return;
  }

  userRepository.updateDocument({
    documentId: userId,
    document: {
      projects: user.projects.concat(projectName),
    },
  });
});
