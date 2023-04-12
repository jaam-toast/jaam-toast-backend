import axios from "axios";

import Config from "@src/infrastructure/@config";

export class CloudFlare {
  api;

  constructor() {
    this.api = axios.create({
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${Config.CLOUDFLARE_ACCOUNT_ID}/pages/projects`,
      timeout: 8000,
      headers: {
        ["X-Auth-Key"]: Config.CLOUDFLARE_API_KEY,
        ["X-Auth-Email"]: Config.CLOUDFLARE_EMAIL,
      },
    });
  }

  async createProject({ projectName }: { projectName: string }) {
    try {
      const { data } = await this.api.post("/", {
        latest_deployment: null,
        name: projectName,
        production_branch: "main",
      });

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteProject({ projectName }: { projectName: string }) {
    try {
      const { data } = await this.api.delete(`/${projectName}`);

      return data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
