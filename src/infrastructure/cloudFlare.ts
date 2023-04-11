import axios from "axios";

type Options = {
  accountId: string;
  apiKey: string;
  authEmail: string;
};

export class CloudFlare {
  api;

  constructor({ accountId, apiKey, authEmail }: Options) {
    this.api = axios.create({
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects`,
      timeout: 8000,
      headers: {
        ["X-Auth-Key"]: apiKey,
        ["X-Auth-Email"]: authEmail,
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
