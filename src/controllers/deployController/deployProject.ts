import ProjectService from "../../services/ProjectService";
import catchAsync from "../../utils/asyncHandler";

const deployProject = catchAsync(async (req, res, next) => {
  const buildOption = req.body;
  const { githubAccessToken } = req.query;
  const { user_id } = req.params;

  const project = new ProjectService({
    ...buildOption,
    userId: user_id,
    githubAccessToken,
  });

  await project.deployProject();

  const {
    repoName,
    repoOwner,
    repoCloneUrl,
    repoUpdatedAt,
    nodeVersion,
    installCommand,
    buildCommand,
    envList,
    buildType,
    deployedUrl,
    buildingLog,
    instanceId,
    lastCommitMessage,
    repoId,
    webhookId,
  } = project;

  return res.status(201).json({
    result: "ok",
    data: {
      repoName,
      repoOwner,
      repoCloneUrl,
      repoUpdatedAt,
      nodeVersion,
      installCommand,
      buildCommand,
      envList,
      buildType,
      deployedUrl,
      buildingLog,
      instanceId,
      lastCommitMessage,
      repoId,
      webhookId,
    },
  });
});

export default deployProject;
