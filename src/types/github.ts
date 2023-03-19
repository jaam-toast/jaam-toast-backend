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

export type GithubRepos = Endpoints["GET /user/repos"]["response"]["data"];

export type GithubOrgs =
  Endpoints["GET /users/{username}/orgs"]["response"]["data"];

export type GithubOrgRepos =
  Endpoints["GET /orgs/{org}/repos"]["response"]["data"];

export type GithubWebhooks =
  Endpoints["POST /repos/{owner}/{repo}/hooks"]["response"]["data"];

export type GithubCommits =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"];

export type GithubPullRequestCommits =
  Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"]["data"];
