import Deployment from "@src/models/Deployment";
import { Deployment as DeploymentType, IdParameter } from "@src/types/db";

class DeploymentModel {
  static async create() {
    const newDeployment = await Deployment.create({
      deployStatus: "pending",
    });

    return newDeployment;
  }

  static async findByIdAndUpdate(id: IdParameter, updateData: DeploymentType) {
    const updatedDeployment = await Deployment.findByIdAndUpdate(id, {
      ...updateData,
    });

    return updatedDeployment;
  }
}

export default DeploymentModel;
