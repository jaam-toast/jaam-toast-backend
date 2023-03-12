import axios from "axios";
import { Endpoints } from "@octokit/types";

import Config from "../../config";

type GithubUserType = {
  login: string;
  url: string;
  avatar_url?: string;
};

type ListUserReposResponse = Endpoints["GET /user/repos"]["response"];
type ListUserOrgsResponse = Endpoints["GET /users/{username}/orgs"]["response"];
type ListOrgReposResponse = Endpoints["GET /orgs/{org}/repos"]["response"];
type CreateWebhookResponse =
  Endpoints["POST /repos/{owner}/{repo}/hooks"]["response"];
type DeleteWebhookResponse =
  Endpoints["DELETE /repos/{owner}/{repo}/hooks/{hook_id}"]["response"];
type ListCommtisResponse =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"];
type PullRequestCommitResponse =
  Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"];

const GithubClient = axios.create({
  baseURL: "https://api.github.com",
  timeout: 2500,
  headers: {
    Accept: "application/vnd.GitHub.+json",
  },
});

export const getUserData = async (accessToken: string) => {
  const { data } = await GithubClient.get<GithubUserType>("/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return data;
};

export const getRepos = async (accessToken: string, repoType: string) => {
  const { data } = await GithubClient.get<ListUserReposResponse["data"]>(
    "/user/repos",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        visibility: `${repoType}`,
        affiliation: "owner",
        sort: "updated",
      },
    },
  );

  return data;
};

export const getOrgs = async (accessToken: string) => {
  const { data } = await GithubClient.get<ListUserOrgsResponse["data"]>(
    "/user/orgs",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return data;
};

export const getOrgRepos = async (accessToken: string, org: string) => {
  const { data } = await GithubClient.get<ListOrgReposResponse["data"]>(
    `/orgs/${org}/repos`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        visibility: "public",
        affiliation: "organization_member",
        sort: "updated",
      },
    },
  );

  return data;
};

export const createRepoWebhook = async (
  accessToken: string,
  repoOwner: string,
  repoName: string,
) => {
  const { data } = await GithubClient.post<CreateWebhookResponse["data"]>(
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
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        owner: `${repoOwner}`,
        repo: `${repoName}`,
      },
    },
  );

  return data;
};

export const deleteRepoWebhook = async (
  accessToken: string,
  repoOwner: string,
  repoName: string,
  webhookId: number,
) => {
  const { data } = await GithubClient.delete<DeleteWebhookResponse>(
    `/repos/${repoOwner}/${repoName}/hooks/${webhookId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        owner: `${repoOwner}`,
        repo: `${repoName}`,
        hook_id: `${webhookId}`,
      },
    },
  );

  return data;
};

export const getCommits = async (
  accessToken: string,
  repoOwner: string,
  repoName: string,
) => {
  const { data } = await GithubClient.get<ListCommtisResponse["data"]>(
    `/repos/${repoOwner}/${repoName}/commits`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return data;
};

export const getHeadCommitMessage = async (
  accessToken: string,
  repoOwner: string,
  repoName: string,
  commitRef: string,
) => {
  const { data } = await GithubClient.get<PullRequestCommitResponse["data"]>(
    `/repos/${repoOwner}/${repoName}/commits/${commitRef}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return data;
};
