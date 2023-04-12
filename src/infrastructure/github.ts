import axios from "axios";

import Config from "./@config";
import { Logger as log } from "../common/Logger";

import type {
  GithubUser,
  GetGithubOrgs,
  GetGithubRepos,
  GetGithubOrgRepos,
  GetGithubWebhooks,
  PostGithubWebhooks,
  GetGithubCommits,
  GetGithubPullRequestCommits,
} from "./@types/github";

// 배포 에러로 인해 잠시 type 삭제

export class Github {
  client;

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
      const { data } = await this.client.get("/user");

      return data;
    } catch (error) {
      log.serverError("An error occurred while retrieving GitHub user data.");
      throw error;
    }
  }

  async getRepos(repoType: string) {
    try {
      const { data } = await this.client.get("/user/repos", {
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
      const { data } = await this.client.get("/user/orgs");

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
      const { data } = await this.client.get(`/orgs/${org}/repos`, {
        params: {
          visibility: "public",
          affiliation: "organization_member",
          sort: "updated",
        },
      });

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
      const { data } = await this.client.get(
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
      const { data } = await this.client.post(
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
      const { data } = await this.client.get(
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
      const { data } = await this.client.get(
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