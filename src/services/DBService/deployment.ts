import Deployment from "@src/models/Deployment";

import type { DeploymentOptions, IdParameter } from "@src/types/db";

class DeploymentService {
  static async create(options?: DeploymentOptions) {
    try {
      const newDeployment = await Deployment.create({
        deployStatus: "pending",
        ...options,
      });

      return newDeployment;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id: IdParameter) {
    try {
      if (!id) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const deployment = await Deployment.findById(id);

      return deployment;
    } catch (error) {
      throw error;
    }
  }

  static async findByIdAndUpdate(id: IdParameter, options: DeploymentOptions) {
    try {
      if (!id || !options) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      const { buildingLog } = options;
      delete options.buildingLog;

      const updatedDeployment = buildingLog
        ? await Deployment.findByIdAndUpdate(
            id,
            { $set: options, $push: { buildingLog: buildingLog[0] } },
            { new: true },
          )
        : await Deployment.findByIdAndUpdate(id, { $set: options });

      return updatedDeployment;
    } catch (error) {
      throw error;
    }
  }
}

export default DeploymentService;
