import axios from "axios";
import { injectable } from "inversify";

import Config from "./@config";

import type { DomainClient } from "src/@config/di.config";

const CLOUDFLARE_TIMEOUT = 1000 * 10;

@injectable()
export class CloudFlareDomainClient implements DomainClient {
  private cloudFlareApi = axios.create({
    baseURL: `https://api.cloudflare.com/client/v4/accounts/${Config.CLOUDFLARE_ACCOUNT_ID}/pages/projects`,
    timeout: CLOUDFLARE_TIMEOUT,
    headers: {
      ["X-Auth-Key"]: Config.CLOUDFLARE_API_KEY,
      ["X-Auth-Email"]: Config.CLOUDFLARE_EMAIL,
    },
  });

  async addDomain({
    projectName,
    domain,
  }: {
    projectName: string;
    domain: string;
  }) {
    try {
      await this.cloudFlareApi.post(`/${projectName}/domains`, {
        name: domain,
      });
    } catch (error) {
      throw error;
    }
  }

  async removeDomain({
    projectName,
    domain,
  }: {
    projectName: string;
    domain: string;
  }) {
    try {
      await this.cloudFlareApi.delete(`/${projectName}/domains/${domain}`);
    } catch (error) {
      throw error;
    }
  }
}
