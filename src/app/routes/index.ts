import { Router } from "express";

import usersRouter from "./users";
import { loginRouter } from "./login";
import { projectsRouter } from "./projects";
import { schemasRouter } from "./schemas";

export const router = Router();

router.use(usersRouter);
router.use(loginRouter);
router.use(projectsRouter);
router.use(schemasRouter);
