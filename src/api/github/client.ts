import axios from "axios";
import { Endpoints } from "@octokit/types";

type GithubUserType = {
  login: string;
  url: string;
  avatar_url?: string;
};

type ListUserReposResponse = Endpoints["GET /user/repos"]["response"];
type ListUserOrgsResponse = Endpoints["GET /users/{username}/orgs"]["response"];
type ListOrgReposResponse = Endpoints["GET /orgs/{org}/repos"]["response"];

const GithubClient = axios.create({
  baseURL: "https://api.GitHub.com",
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

export const getPublicRepos = async (accessToken: string) => {
  const { data } = await GithubClient.get<ListUserReposResponse["data"]>(
    "/user/repos",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        visibility: "public",
        affiliation: "owner",
        sort: "updated",
      },
    },
  );

  return data;
};

export const getPrivateRepos = async (accessToken: string) => {
  const { data } = await GithubClient.get<ListUserReposResponse["data"]>(
    "/user/repos",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        visibility: "private",
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
