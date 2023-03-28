import axios from "axios";

import Config from "../../config";
import {
  UpdateDeploymentOptions,
  UpdateProjectOptions,
} from "../../types/dbClient";

class DBClient {
  client;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: Config.MAIN_SERVER_URL,
      timeout: 2500,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async updateProject(options: UpdateProjectOptions) {
    const { projectName } = options;

    try {
      const { data } = await this.client.put(
        `/projects/${projectName}`,
        options,
      );

      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateDeployment(options: UpdateDeploymentOptions) {
    const { deploymentId } = options;

    try {
      const { data } = await this.client.put(
        `/deployments/${deploymentId}`,
        options,
      );

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default DBClient;
