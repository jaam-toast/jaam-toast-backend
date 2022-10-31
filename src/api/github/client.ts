import axios from "axios";
import { Endpoints } from "@octokit/types";

type GithubUserType = {
  login: string;
  url: string;
  avatar_url?: string;
};

type ListUserOrgsResponse = Endpoints["GET /users/{username}/orgs"]["response"];
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
