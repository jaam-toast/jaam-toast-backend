import { Router } from "express";

import usersRouter from "./routeUsers";
import { loginRouter } from "./routeLogin";
import { projectsRouter } from "./routeProjects";
import { schemasRouter } from "./routeSchemas";

export const router = Router();

router.use(usersRouter);
router.use(loginRouter);
router.use(projectsRouter);
router.use(schemasRouter);
