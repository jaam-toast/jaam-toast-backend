import createError from "http-errors";

import verifyGithubSignature from "../middlewares/verifyGithubSignature";
import { asyncHandler as catchAsync } from "../utils/asyncHandler";

import { Router } from "express";

const route = Router();

const reposRouter = (app: Router) => {
  app.use("/repos", route);

  route.post(
    "/hooks",
    verifyGithubSignature,
    catchAsync(async (req, res, next) => {
      const { project_name: projectName } = req.params;
      const eventType = req.header("X-GitHub-Event");

      if (eventType === "ping") {
        return res.json({
          message: "The webhook has been successfully installed.",
        });
      }

      const updatedBranch = req.body.ref.slice(11);
      const { head_commit: headCommit, repository } = req.body;

      if (!headCommit) {
        return next(createError(400, "Cannot find environment data"));
      }

      if (updatedBranch !== "main" && updatedBranch !== "master") {
        return res.status(304).json({
          message: "ok",
        });
      }

      // const project = new ProjectService();
      // await project.updateProject({
      //   projectName,
      //   webhookId: repository.id,
      //   projectUpdatedAt: headCommit.timestamp,
      //   lastCommitMessage: headCommit.message,
      //   lastCommitHash: headCommit.id,
      // });
      // const { projectId } = project;

      // if (!projectId) {
      //   return next(createError(500, "Failed to update database."));
      // }

      return res.json({
        message: "ok",
        // result: projectId,
      });
    }),
  );
};

export default reposRouter;
