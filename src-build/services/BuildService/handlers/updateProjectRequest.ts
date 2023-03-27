import log from "../../Logger";
import BuildService from "..";
import DBClient from "../../DBClient";

const updateProjectRequest = async (service: BuildService, next: Function) => {
  const { subdomain, deployedUrl, deploymentId, instanceId, publicIpAddress } =
    service;

  console.log("updateProjectRequest", {
    subdomain,
    deployedUrl,
    deploymentId,
    instanceId,
    publicIpAddress,
  });

  if (
    !subdomain ||
    !deploymentId ||
    !instanceId ||
    !deployedUrl ||
    !publicIpAddress
  ) {
    service.throw("Cannot find environment data before update project");
  }

  try {
    const dbClient = new DBClient();
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
