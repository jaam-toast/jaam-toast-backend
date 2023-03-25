import axios from "axios";

import Config from "@src/config";
import log from "@src/services/Logger";
import {
  GithubUser,
  GithubOrgs,
  GithubRepos,
  GithubOrgRepos,
  GithubGetWebhooks,
  GithubWebhooks,
  GithubCommits,
  GithubPullRequestCommits,
} from "@src/types/github";

class GithubClient {
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
      const { data } = await this.client.get<GithubUser>("/user");

      return data;
    } catch (error) {
      log.serverError("An error occurred while retrieving GitHub user data.");
      throw error;
    }
  }

  async getRepos(repoType: string) {
    try {
      const { data } = await this.client.get<GithubRepos>("/user/repos", {
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
      const { data } = await this.client.get<GithubOrgs>("/user/orgs");

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
      const { data } = await this.client.get<GithubOrgRepos>(
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
      const { data } = await this.client.get<GithubGetWebhooks>(
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
      const { data } = await this.client.post<GithubWebhooks>(
        `/repos/${repoOwner}/${repoName}/hooks`,
        {
          name: "web",
          active: true,
          events: ["push"],
          config: {
            url: `${Config.WEBHOOK_PAYLOAD_URL}`,
            content_type: "json",
            insecure_ssl: "0",
            secret: `${Config.WEBHOOK_SECRET_KEY}`,
          },
        },
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
        "An error occurred while creating a GitHub repository webhook.",
      );
      throw error;
    }
  }

  async getCommits(repoOwner: string, repoName: string) {
    try {
      const { data } = await this.client.get<GithubCommits>(
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
      const { data } = await this.client.get<GithubPullRequestCommits>(
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

export default GithubClient;
