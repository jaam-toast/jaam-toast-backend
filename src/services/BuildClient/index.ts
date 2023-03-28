import axios from "axios";

import Config from "@src/config";
import {
  CreateBuildOptions,
  UpdateBuildOptions,
  DeleteBuildOptions,
} from "@src/types/buildClient";

class BuildClient {
  client;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: Config.BUILD_SERVER_URL,
      timeout: 2500,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async createBuild(options: CreateBuildOptions) {
    const { projectId, deploymentId } = options;

    try {
      const { data } = await this.client.post(
        `/build/${projectId}/${deploymentId}`,
        options,
      );

      return data;
    } catch (error) {
      throw error;
    }
  }

  async updateBuild(options: UpdateBuildOptions) {
    const { projectId, deploymentId } = options;

    try {
      const data = await this.client.put(
        `/build/${projectId}/${deploymentId}`,
        options,
      );

      return data;
    } catch (error) {
      throw error;
    }
  }

  async deleteBuild(options: DeleteBuildOptions) {
    const { projectId, projectName, instanceId, publicIpAddress } = options;

    try {
      const data = await this.client.delete(
        `/build/${projectId}?subdomain=${projectName}&instanceId=${instanceId}&ip=${publicIpAddress}`,
      );

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export default BuildClient;
