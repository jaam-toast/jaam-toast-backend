import { injectable } from "inversify";
import axios from "axios";

import Config from "./@config";

import type { Endpoints } from "@octokit/types";

@injectable()
export class GithubClient {
  private dataClient = axios.create({
    baseURL: "https://api.github.com",
    timeout: 2500,
    headers: {
      Accept: "application/vnd.GitHub.+json",
    },
  });

  private oauthClient = axios.create({
    baseURL: "https://github.com",
    timeout: 2500,
    headers: {
      Accept: "application/json",
    },
  });

  async getToken({ code }: { code: string }) {
    type GithubToken = {
      access_token: string;
      scope: string;
      token_type: string;
    };

    const { data } = await this.oauthClient.post<GithubToken>(
      "/login/oauth/access_token?",
      {},
      {
        params: {
          client_id: Config.GITHUB_CLIENT_ID,
          client_secret: Config.GITHUB_CLIENT_SECRET,
          redirect_uri: Config.GITHUB_REDIRECT_URL,
          code,
        },
      },
    );

    return data.access_token;
  }

  async getUserInstallations({ accessToken }: { accessToken: string }) {
    type GithubInstallation = {
      installations?: {
        id: number;
        account: {
          id: number;
          login: string;
          avatar_url: string;
          repos_url: string;
          url: string;
          type: string;
        };
        repository_selection: "selected";
      }[];
      total_count: number;
    };

    const { data } = await this.dataClient.get<GithubInstallation>(
      "/user/installations",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    return data;
  }

  async getInstallationRepos({
    accessToken,
    spaceId,
  }: {
    accessToken: string;
    spaceId: string;
  }) {
    try {
      type GetInstallationRepos = {
        total_count: number;
        repositories: {
          full_name: string;
          clone_url: string;
          updated_at: string;
        }[];
      };

      const { data } = await this.dataClient.get<GetInstallationRepos>(
        `/user/installations/${spaceId}/repositories`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getUserData({ accessToken }: { accessToken: string }) {
    try {
      type GithubUser = {
        login: string;
        url: string;
        avatar_url?: string;
      };

      const { data } = await this.dataClient.get<GithubUser>("/user", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return data;
    } catch (error) {
      throw error;
    }
  }
}
