import ProjectService from "../../services/ProjectService";

import catchAsync from "../../utils/asyncHandler";

const deployProject = catchAsync(async (req, res, next) => {
  const buildOption = req.body;
  const { githubAccessToken } = req.query;
  const project = new ProjectService({
    ...buildOption,
    githubAccessToken,
  });

  project.deployProject();

  return res.status(201).json({
    result: "ok",
    data: project,
  });
});

export default deployProject;
