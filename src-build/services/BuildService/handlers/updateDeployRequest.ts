import BuildService from "..";
import DBClient from "../../DBClient";
import { signJwt } from "../../../controllers/utils/jwt";

const updateDeployRequest = async (service: BuildService, next: Function) => {
  const { projectId, deploymentId, buildingLog } = service;

  if (!projectId || !deploymentId || !buildingLog) {
    service.throw("Cannot find deploymentId before update deployment");
  }

  try {
    const token = signJwt(projectId);
    const dbClient = new DBClient(token);
    const updatedDeployement = await dbClient.updateDeployment({
      deploymentId,
      deployStatus: "success",
      buildingLog: buildingLog,
    });

    if (!updatedDeployement) {
      service.throw("deployment update failed.");
    }

    service.buildLog("deployment data saved successfully.");

    // * 배포 완료
    service.buildLog("A new deployment's data is saved successfully!");
  } catch (error) {
    service.throw(
      "An unexpected error occurred during getting Instance runtime logs.",
      error,
    );
  }

  next();
};

export default updateDeployRequest;
