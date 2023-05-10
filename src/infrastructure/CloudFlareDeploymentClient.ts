import axios from "axios";
import { injectable } from "inversify";

import Config from "./@config";
import * as log from "../@utils/log";
import { UnknownError } from "../@utils/defineErrors";
import { runCommand } from "../@utils/runCommand";

import type { DeploymentClient } from "../@config/di.config";

const CLOUDFLARE_TIMEOUT = 1000 * 10;

@injectable()
export class CloudFlareDeploymentClient implements DeploymentClient {
  private cloudFlareApi = axios.create({
    baseURL: `https://api.cloudflare.com/client/v4/accounts/${Config.CLOUDFLARE_ACCOUNT_ID}/pages/projects`,
    timeout: CLOUDFLARE_TIMEOUT,
    headers: {
      ["X-Auth-Key"]: Config.CLOUDFLARE_API_KEY,
      ["X-Auth-Email"]: Config.CLOUDFLARE_EMAIL,
    },
  });

  async createDeployment({
    deploymentName,
    resourcePath,
  }: {
    deploymentName: string;
    resourcePath: string;
  }) {
    try {
      const { data } = await this.cloudFlareApi.post<{
        messages: {
          code: number;
          message: string;
        }[];
        result: {
          subdomain?: string;
        };
        success: boolean;
      }>("/", {
        latest_deployment: null,
        name: deploymentName,
        production_branch: "main",
      });

      if (!data.success || !data.result.subdomain) {
        throw new UnknownError(
          "An error occurred while creating the cloudflare project.",
        );
      }

      await runCommand({
        command: [
          `CLOUDFLARE_ACCOUNT_ID=${Config.CLOUDFLARE_ACCOUNT_ID} CLOUDFLARE_API_TOKEN=${Config.CLOUDFLARE_API_TOKEN} npx wrangler pages publish ${resourcePath} --project-name ${deploymentName} --branch main`,
          "rm -rf buildResource",
        ],
        onStdout: log.debug,
        onStderr: log.debug,
      });

      log.debug("Project deploying complete");

      return data.result.subdomain;
    } catch (error) {
      throw new UnknownError(
        "An error occurred while creating the cloudflare project.",
        error,
      );
    }
  }

  async deleteDeployment({ deploymentName }: { deploymentName: string }) {
    try {
      const { data } = await this.cloudFlareApi.delete(`/${deploymentName}`);

      return data;
    } catch (error) {
      log.serverError(
        "Error occurred during the Cloudflare page project delete operation",
      );
      throw error;
    }
  }

  async getDeploymentStauts({ deploymentName }: { deploymentName: string }) {
    try {
      const { data } = await this.cloudFlareApi.get(`/${deploymentName}`);

      return data;
    } catch (error) {
      log.serverError(
        "Error occurred during the Cloudflare page project get operation",
      );
      throw error;
    }
  }
}
