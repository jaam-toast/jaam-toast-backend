import axios, { AxiosInstance } from "axios";

import Config from "./@config";
import { Logger as log } from "../@utils/Logger";

import type { Endpoints } from "@octokit/types";

export class Github {
  client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: "https://api.github.com",
      timeout: 2500,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.GitHub.+json",
      },
    });
  }

  async getUserData() {
    try {
      type GithubUser = {
        login: string;
        url: string;
        avatar_url?: string;
      };

      const { data } = await this.client.get<GithubUser>("/user");

      return data;
    } catch (error) {
      log.serverError("An error occurred while retrieving GitHub user data.");
      throw error;
    }
  }

  async getRepos(repoType: string) {
    try {
      type GetGithubRepos = Endpoints["GET /user/repos"]["response"]["data"];

      const { data } = await this.client.get<GetGithubRepos>("/user/repos", {
        params: {
          visibility: `${repoType}`,
          affiliation: "owner",
          sort: "updated",
        },
      });

      return data;
    } catch (error) {
      log.serverError(
        "An error occurred while retrieving GitHub repository data.",
      );
      throw error;
    }
  }

  async getOrgs() {
    try {
      type GetGithubOrgs =
        Endpoints["GET /users/{username}/orgs"]["response"]["data"];

      const { data } = await this.client.get<GetGithubOrgs>("/user/orgs");

      return data;
    } catch (error) {
      log.serverError(
        "An error occurred while retrieving GitHub oranization data.",
      );
      throw error;
    }
  }

  async getOrgRepos(org: string) {
    try {
      type GetGithubOrgRepos =
        Endpoints["GET /orgs/{org}/repos"]["response"]["data"];

      const { data } = await this.client.get<GetGithubOrgRepos>(
        `/orgs/${org}/repos`,
        {
          params: {
            visibility: "public",
            affiliation: "organization_member",
            sort: "updated",
          },
        },
      );

      return data;
    } catch (error) {
      log.serverError(
        "An error occurred while retrieving GitHub organization repository data.",
      );
      throw error;
    }
  }

  async getRepoWebhook(repoOwner: string, repoName: string) {
    try {
      type GetGithubWebhooks =
        Endpoints["GET /repos/{owner}/{repo}/hooks"]["response"]["data"];

      const { data } = await this.client.get<GetGithubWebhooks>(
        `/repos/${repoOwner}/${repoName}/hooks`,
        {
          params: {
            owner: `${repoOwner}`,
            repo: `${repoName}`,
          },
        },
      );

      return data;
    } catch (error) {
      log.serverError(
        "An error occurred while get a GitHub repository webhook.",
      );
      throw error;
    }
  }

  async createRepoWebhook(repoOwner: string, repoName: string) {
    try {
      type PostGithubWebhooks =
        Endpoints["POST /repos/{owner}/{repo}/hooks"]["response"]["data"];

      const { data } = await this.client.post<PostGithubWebhooks>(
        `/repos/${repoOwner}/${repoName}/hooks`,
        {
          name: "web",
          active: true,
          events: ["push"],
          config: {
            url: `${Config.GITHUB_WEBHOOK_PAYLOAD_URL}`,
            content_type: "json",
            insecure_ssl: "0",
            secret: `${Config.GITHUB_WEBHOOK_SECRET_KEY}`,
          },
        },
        {
          params: {
            owner: repoOwner,
            repo: repoName,
          },
        },
      );

      return data;
    } catch (error) {
      log.serverError(
        "An error occurred while creating a GitHub repository webhook.",
      );
      throw error;
    }
  }

  async getCommits(repoOwner: string, repoName: string) {
    try {
      type GetGithubCommits =
        Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"];

      const { data } = await this.client.get<GetGithubCommits>(
        `/repos/${repoOwner}/${repoName}/commits`,
      );

      return data;
    } catch (error) {
      log.serverError("An error occurred while retrieving GitHub commit data.");
      throw error;
    }
  }

  async getHeadCommitMessage(
    repoOwner: string,
    repoName: string,
    commitRef: string,
  ) {
    try {
      type GetGithubPullRequestCommits =
        Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"]["data"];

      const { data } = await this.client.get<GetGithubPullRequestCommits>(
        `/repos/${repoOwner}/${repoName}/commits/${commitRef}`,
      );

      return data;
    } catch (error) {
      log.serverError(
        "An error occurred while retrieving GitHub head commit data.",
      );
      throw error;
    }
  }
}

export class OauthClient {
  client = axios.create({
    baseURL: "https://github.com",
    timeout: 2500,
    headers: {
      Accept: "application/json",
    },
  });

  async getToken(code: string) {
    type GithubToken = {
      access_token: string;
      scope: string;
      token_type: string;
    };

    const { data } = await this.client.post<GithubToken>(
      "/login/oauth/access_token?",
      {},
      {
        params: {
          client_id: Config.GITHUB_CLIENT_ID,
          client_secret: Config.GITHUB_CLIENT_SECRET,
          code,
        },
      },
    );

    return data.access_token;
  }
}
