import { Router } from "express";

import { usersRouter } from "./routeUsers";
import { loginRouter } from "./routeLogin";
import { projectsRouter } from "./routeProjects";
import { projectOptionsRouter } from "./routeProjectOptions";
import { schemasRouter } from "./routeSchemas";
import { storageRouter } from "./routeStorage";

export const router = Router();

router.use(usersRouter);
router.use(loginRouter);
router.use(projectsRouter);
router.use(projectOptionsRouter);
router.use(schemasRouter);
router.use(storageRouter);
