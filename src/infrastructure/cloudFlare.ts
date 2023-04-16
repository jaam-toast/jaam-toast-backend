import axios, { AxiosInstance } from "axios";

import Config from "./@config";
import { Logger as log } from "src/util/Logger";

export class CloudFlare {
  api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: `https://api.cloudflare.com/client/v4/accounts/${Config.CLOUDFLARE_ACCOUNT_ID}/pages/projects`,
      timeout: 10000,
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
      log.serverError(
        "Error occurred during the Cloudflare page project create operation",
      );
      throw error;
    }
  }

  async deleteProject({ projectName }: { projectName: string }) {
    try {
      const { data } = await this.api.delete(`/${projectName}`);

      return data;
    } catch (error) {
      log.serverError(
        "Error occurred during the Cloudflare page project delete operation",
      );
      throw error;
    }
  }

  async getDomain({ projectName }) {
    try {
      const { data } = await this.api.get(`/${projectName}/domains`);

      return data;
    } catch (error) {
      log.serverError(
        "Error occurred during the Cloudflare page domain fetch operation",
      );
      throw error;
    }
  }

  async addDomain({ projectName, changeDomain }) {
    try {
      const { data } = await this.api.post(`/${projectName}/domains`, {
        name: changeDomain,
      });

      return data;
    } catch (error) {
      log.serverError(
        "Error occurred during the Cloudflare page domain add operation",
      );
      throw error;
    }
  }

  async removeDomain({ projectName, domain }) {
    try {
      const { data } = await this.api.delete(
        `/${projectName}/domains/${domain}`,
      );

      return data;
    } catch (error) {
      log.serverError(
        "Error occurred during the Cloudflare page domain delete operation",
      );
      throw error;
    }
  }

  makePublishPageCommand({ buildResourceLocation, projectName }) {
    return `CLOUDFLARE_ACCOUNT_ID=${Config.CLOUDFLARE_ACCOUNT_ID} CLOUDFLARE_API_TOKEN=${Config.CLOUDFLARE_API_TOKEN} npx wrangler pages publish ${buildResourceLocation} --project-name ${projectName} --branch main`;
  }
}
