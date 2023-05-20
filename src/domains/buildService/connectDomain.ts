9export function connectDomain() {
  try {
    const [project] = await this.projectRepository.readDocument({
      documentId: projectName,
    });

    if (!project) {
      throw new NotFoundError("Cannot find Project data.");
    }
    if (!project.originalBuildDomain) {
      throw new ForbiddenError(
        "Cannot delete domain sinse the project initially delployed yet.",
      );
    }

    await this.recordClient.createCNAME({
      recordName: customDomain,
      recordTarget: project.originalBuildDomain,
    });

    await this.deploymentClient.updateDeploymentDomain({
      deploymentData: project.deploymentData,
      domain: project.customDomain.concat(customDomain),
    });
  } catch (error) {
    throw new UnknownError(
      "An unexpected error occurred during connect custom domain.",
      error,
    );
  }
}
