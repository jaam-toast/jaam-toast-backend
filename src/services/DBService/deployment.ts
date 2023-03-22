import Deployment from "@src/models/Deployment";
import { Deployment as DeploymentType } from "@src/types";

class DeploymentModel {
  static async create() {
    const newDeployment = await Deployment.create({
      deployStatus: "pending",
    });

    return newDeployment;
  }

  static async findByIdAndUpdate(
    id: DeploymentType["_id"] | string,
    data: DeploymentType,
  ) {
    const {
      buildingLog,
      deployedStatus,
      lastCommitMessage,
      lastCommitHash,
      repoUpdatedAt,
    } = data;

    const updatedDeployment = await Deployment.findByIdAndUpdate(id, {
      buildingLog,
      deployedStatus,
      lastCommitMessage,
      lastCommitHash,
      repoUpdatedAt,
    });

    return updatedDeployment;
  }
}

export default DeploymentModel;
