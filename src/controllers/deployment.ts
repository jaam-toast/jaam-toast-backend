import catchAsync from "@src/controllers/utils/asyncHandler";
import DB from "@src/services/DBService";

export const getDeployment = catchAsync(async (req, res, next) => {
  const { deployment_id } = req.params;
  const deployment = await DB.Deployment.findById(deployment_id);

  return res.json({
    message: "ok",
    result: deployment,
  });
});

export const updateDeployment = catchAsync(async (req, res, next) => {
  const { deployment_id } = req.params;
  const updateOptions = req.body;

  const updatedDeployment = await DB.Deployment.findByIdAndUpdate(
    deployment_id,
    updateOptions,
  );

  return res.status(201).json({
    message: "ok",
    result: updatedDeployment,
  });
});
