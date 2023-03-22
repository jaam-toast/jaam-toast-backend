import Deployment from "@src/models/Deployment";
import { Deployment as DeploymentType, IdParameter } from "@src/types/db";

class DeploymentModel {
  static async create() {
    const newDeployment = await Deployment.create({
      deployStatus: "pending",
    });

    return newDeployment;
  }

  static async findByIdAndUpdate(id: IdParameter, data: DeploymentType) {
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
