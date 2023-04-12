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

export type GetGithubRepos = Endpoints["GET /user/repos"]["response"]["data"];

export type GetGithubOrgs =
  Endpoints["GET /users/{username}/orgs"]["response"]["data"];

export type GetGithubOrgRepos =
  Endpoints["GET /orgs/{org}/repos"]["response"]["data"];

export type GetGithubWebhooks =
  Endpoints["GET /repos/{owner}/{repo}/hooks"]["response"]["data"];

export type PostGithubWebhooks =
  Endpoints["POST /repos/{owner}/{repo}/hooks"]["response"]["data"];

export type GetGithubCommits =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"];

export type GetGithubPullRequestCommits =
  Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"]["data"];
