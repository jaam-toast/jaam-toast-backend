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
          code,
        },
      },
    );

    return data.access_token;
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

  async getRepos({ accessToken }: { accessToken: string }) {
    try {
      type GetGithubRepos = Endpoints["GET /user/repos"]["response"]["data"];

      const { data } = await this.dataClient.get<GetGithubRepos>(
        "/user/repos",
        {
          params: {
            visibility: "public",
            affiliation: "owner",
            sort: "updated",
          },
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

  async getOrgs({ accessToken }: { accessToken: string }) {
    try {
      type GetGithubOrgs =
        Endpoints["GET /users/{username}/orgs"]["response"]["data"];

      const { data } = await this.dataClient.get<GetGithubOrgs>("/user/orgs", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return data;
    } catch (error) {
      throw error;
    }
  }

  async getOrgRepos({
    accessToken,
    org,
  }: {
    accessToken: string;
    org: string;
  }) {
    try {
      type GetGithubOrgRepos =
        Endpoints["GET /orgs/{org}/repos"]["response"]["data"];

      const { data } = await this.dataClient.get<GetGithubOrgRepos>(
        `/orgs/${org}/repos`,
        {
          params: {
            visibility: "public",
            affiliation: "organization_member",
            sort: "updated",
          },
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

  async getRepoWebhook({
    accessToken,
    repoOwner,
    repoName,
  }: {
    accessToken: string;
    repoOwner: string;
    repoName: string;
  }) {
    try {
      type GetGithubWebhooks =
        Endpoints["GET /repos/{owner}/{repo}/hooks"]["response"]["data"];

      const { data } = await this.dataClient.get<GetGithubWebhooks>(
        `/repos/${repoOwner}/${repoName}/hooks`,
        {
          params: {
            owner: `${repoOwner}`,
            repo: `${repoName}`,
          },
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

  async createRepoWebhook({
    accessToken,
    repoOwner,
    repoName,
  }: {
    accessToken: string;
    repoOwner: string;
    repoName: string;
  }) {
    try {
      type PostGithubWebhooks =
        Endpoints["POST /repos/{owner}/{repo}/hooks"]["response"]["data"];

      const { data } = await this.dataClient.post<PostGithubWebhooks>(
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

  async getCommits({
    accessToken,
    repoOwner,
    repoName,
  }: {
    accessToken: string;
    repoOwner: string;
    repoName: string;
  }) {
    try {
      type GetGithubCommits =
        Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"];

      const { data } = await this.dataClient.get<GetGithubCommits>(
        `/repos/${repoOwner}/${repoName}/commits`,
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

  async getHeadCommitMessage({
    accessToken,
    repoOwner,
    repoName,
    commitRef,
  }: {
    accessToken: string;
    repoOwner: string;
    repoName: string;
    commitRef: string;
  }) {
    try {
      type GetGithubPullRequestCommits =
        Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"]["data"];

      const { data } = await this.dataClient.get<GetGithubPullRequestCommits>(
        `/repos/${repoOwner}/${repoName}/commits/${commitRef}`,
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
}
