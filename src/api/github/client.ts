import axios, { AxiosInstance } from "axios";

type GithubUserType = {
  login: string;
  url: string;
  avatar_url?: string;
};

const GithubClient: AxiosInstance = axios.create({
  baseURL: "https://api.GitHub.com",
  timeout: 2500,
  headers: {
    Accept: "application/vnd.GitHub.v3+json",
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

export const getPublicRepos = async () => {};
