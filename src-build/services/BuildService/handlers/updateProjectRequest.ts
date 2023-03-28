import log from "../../Logger";
import BuildService from "..";
import DBClient from "../../DBClient";
import { signJwt } from "../../../controllers/utils/jwt";

const updateProjectRequest = async (service: BuildService, next: Function) => {
  const {
    projectId,
    subdomain,
    deployedUrl,
    deploymentId,
    instanceId,
    publicIpAddress,
  } = service;

  if (
    !projectId ||
    !subdomain ||
    !deploymentId ||
    !instanceId ||
    !deployedUrl ||
    !publicIpAddress
  ) {
    service.throw("Cannot find environment data before update project");
  }

  try {
    const token = signJwt(projectId);
    const dbClient = new DBClient(token);
    const updatedProject = await dbClient.updateProject({
      projectName: subdomain,
      instanceId,
      deployedUrl,
      publicIpAddress,
    });

    if (!updatedProject) {
      service.throw("project update failed.");
    }

    log.build("Instance data and deployed url saved successfully.");
  } catch (error) {
    service.throw(
      "An unexpected error occurred during getting Instance runtime logs.",
      error,
    );
  }

  next();
};

export default updateProjectRequest;
