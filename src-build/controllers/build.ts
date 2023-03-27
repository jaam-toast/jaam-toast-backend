import createError from "http-errors";

import BuildService from "../services/BuildService";
import catchAsync from "./utils/asyncHandler";

export const createBuild = catchAsync(async (req, res, next) => {
  const { project_id: projectId, deployment_id: deploymentId } = req.params;
  const deployOptions = req.body;

  if (!projectId || !deploymentId || !deployOptions) {
    return next(createError(401, "Cannot find environment data."));
  }

  res.json({
    message: "ok",
  });

  const project = new BuildService();
  await project.startBuild({
    projectId,
    deploymentId,
    ...deployOptions,
    subdomain: deployOptions.projectName,
  });

  return;
});

export const updateBuild = catchAsync(async (req, res, next) => {
  const { project_id, deployment_id } = req.params;
  const deployOptions = req.body;

  res.status(201).json({
    message: "ok",
  });

  const project = new BuildService();
  // * deploy 삭제
  await project.removeBuild({
    subdomain: deployOptions.projectName,
    instanceId: deployOptions.instanceId,
    publicIpAddress: deployOptions.publicIpAddress,
  });
  // * 재생성
  await project.startBuild({
    projectId: project_id,
    deploymentId: deployment_id,
    ...deployOptions,
    subdomain: deployOptions.projectName,
  });
});

export const deleteBuild = catchAsync(async (req, res, next) => {
  const { project_name, instance_id, public_ip_Address } = req.params;

  if (!project_name || !instance_id || !public_ip_Address) {
    return next(createError(401, "Cannot find environment data."));
  }

  const project = new BuildService();
  await project.removeBuild({
    subdomain: project_name,
    instanceId: instance_id,
    publicIpAddress: public_ip_Address,
  });

  return res.status(201).json({
    message: "ok",
  });
});
