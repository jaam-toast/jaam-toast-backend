import { Endpoints } from "@octokit/types";

export type GithubToken = {
  access_token: string;
  scope: string;
  token_type: string;
};

export type GithubUser = {
  login: string;
  url: string;
  avatar_url?: string;
};

export type ListUserReposResponse = Endpoints["GET /user/repos"]["response"];

export type ListUserOrgsResponse =
  Endpoints["GET /users/{username}/orgs"]["response"];

export type ListOrgReposResponse =
  Endpoints["GET /orgs/{org}/repos"]["response"];

export type CreateWebhookResponse =
  Endpoints["POST /repos/{owner}/{repo}/hooks"]["response"];

export type ListCommtisResponse =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"];

export type PullRequestCommitResponse =
  Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"];
