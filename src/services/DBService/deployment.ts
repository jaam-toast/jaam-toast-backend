import Deployment from "@src/models/Deployment";
import {
  Deployment as DeploymentType,
  DeploymentOptions,
  IdParameter,
} from "@src/types/db";

class DeploymentService {
  static async create(options?: DeploymentOptions) {
    try {
      let newDeployment;

      if (options && Object.keys(options).length) {
        newDeployment = await Deployment.create({
          deployStatus: "pending",
          ...options,
        });
      } else {
        newDeployment = await Deployment.create({
          deployStatus: "pending",
        });
      }

      return newDeployment;
    } catch (error) {
      throw error;
    }
  }

  static async findByIdAndUpdate(id: IdParameter, data: DeploymentType) {
    try {
      if (!id || !data) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      const updatedDeployment = await Deployment.findByIdAndUpdate(id, {
        ...data,
      });

      return updatedDeployment;
    } catch (error) {
      throw error;
    }
  }
}

export default DeploymentService;
