import axios from "axios";
import Config from "../../config";
import {
  GithubUser,
  ListUserReposResponse,
  ListUserOrgsResponse,
  ListOrgReposResponse,
  CreateWebhookResponse,
  ListCommtisResponse,
  PullRequestCommitResponse,
} from "../../types/github";

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
      throw new Error(
        "Error: Run failed by requesting user data to github client.",
      );
    }
  }

  async getRepos(repoType: string) {
    try {
      const { data } = await this.client.get<ListUserReposResponse["data"]>(
        "/user/repos",
        {
          params: {
            visibility: `${repoType}`,
            affiliation: "owner",
            sort: "updated",
          },
        },
      );

      return data;
    } catch (error) {
      throw new Error(
        "Error: Run failed by requesting repository data to github client.",
      );
    }
  }

  async getOrgs() {
    try {
      const { data } = await this.client.get<ListUserOrgsResponse["data"]>(
        "/user/orgs",
      );

      return data;
    } catch (error) {
      throw new Error(
        "Error: Run failed by requesting organization data to github client.",
      );
    }
  }

  async getOrgRepos(org: string) {
    try {
      const { data } = await this.client.get<ListOrgReposResponse["data"]>(
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
      throw new Error(
        "Error: Run failed by requesting organization repository data to github client.",
      );
    }
  }

  async createRepoWebhook(repoOwner: string, repoName: string) {
    try {
      const { data } = await this.client.post<CreateWebhookResponse["data"]>(
        `/repos/${repoOwner}/${repoName}/hooks`,
        {
          name: "web",
          active: true,
          events: ["pull_request"],
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
      throw new Error(
        "Error: Run failed by creating webhook to github repository.",
      );
    }
  }

  async getCommits(repoOwner: string, repoName: string) {
    try {
      const { data } = await this.client.get<ListCommtisResponse["data"]>(
        `/repos/${repoOwner}/${repoName}/commits`,
      );

      return data;
    } catch (error) {
      throw new Error(
        "Error: Run failed by requesting commit data to github client.",
      );
    }
  }

  async getHeadCommitMessage(
    repoOwner: string,
    repoName: string,
    commitRef: string,
  ) {
    try {
      const { data } = await this.client.get<PullRequestCommitResponse["data"]>(
        `/repos/${repoOwner}/${repoName}/commits/${commitRef}`,
      );

      return data;
    } catch (error) {
      throw new Error(
        "Error: Run failed by requesting commit message data to github client.",
      );
    }
  }
}

export default GithubClient;
